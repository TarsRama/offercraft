import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Default to last 6 months if no dates provided
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const dateFilter = {
      createdAt: {
        gte: startDate ? new Date(startDate) : sixMonthsAgo,
        lte: endDate ? new Date(endDate) : new Date(),
      },
    };

    const where = {
      tenantId: session.user.tenantId,
      ...dateFilter,
    };

    // Get basic stats
    const [
      totalOffers,
      acceptedOffers,
      rejectedOffers,
      pendingOffers,
      totalRevenue,
      totalClients,
    ] = await Promise.all([
      prisma.offer.count({ where }),
      prisma.offer.count({ where: { ...where, status: "ACCEPTED" } }),
      prisma.offer.count({ where: { ...where, status: "REJECTED" } }),
      prisma.offer.count({ where: { ...where, status: { in: ["SENT", "VIEWED"] } } }),
      prisma.offer.aggregate({
        where: { ...where, status: "ACCEPTED" },
        _sum: { total: true },
      }),
      prisma.client.count({
        where: {
          tenantId: session.user.tenantId,
          createdAt: dateFilter.createdAt,
        },
      }),
    ]);

    // Offers by status for funnel chart
    const offersByStatus = await prisma.offer.groupBy({
      by: ["status"],
      where,
      _count: { status: true },
    });

    // Monthly revenue trend
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM(total) as revenue,
        COUNT(*) as count
      FROM "offers"
      WHERE 
        "tenantId" = ${session.user.tenantId}
        AND "status" = 'ACCEPTED'
        AND "createdAt" >= ${dateFilter.createdAt.gte}
        AND "createdAt" <= ${dateFilter.createdAt.lte}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month
    `;

    // Top clients by revenue
    const topClients = await prisma.client.findMany({
      where: {
        tenantId: session.user.tenantId,
        offers: {
          some: {
            status: "ACCEPTED",
            createdAt: dateFilter.createdAt,
          },
        },
      },
      select: {
        id: true,
        companyName: true,
        offers: {
          where: {
            status: "ACCEPTED",
            createdAt: dateFilter.createdAt,
          },
          select: {
            total: true,
          },
        },
      },
      take: 5,
    }).then(clients =>
      clients.map(client => ({
        id: client.id,
        name: client.companyName,
        revenue: client.offers.reduce((sum, offer) => sum + parseFloat(offer.total.toString()), 0),
        offerCount: client.offers.length,
      })).sort((a, b) => b.revenue - a.revenue)
    );

    // Calculate conversion metrics
    const winRate = totalOffers > 0 ? (acceptedOffers / totalOffers) * 100 : 0;
    const lossRate = totalOffers > 0 ? (rejectedOffers / totalOffers) * 100 : 0;
    const averageOfferValue = acceptedOffers > 0 ? (totalRevenue._sum.total || 0) / acceptedOffers : 0;

    // Get average conversion time (from sent to accepted)
    const acceptedOffersWithTimes = await prisma.offer.findMany({
      where: {
        ...where,
        status: "ACCEPTED",
        sentAt: { not: null },
        acceptedAt: { not: null },
      },
      select: {
        sentAt: true,
        acceptedAt: true,
      },
    });

    const averageConversionDays = acceptedOffersWithTimes.length > 0
      ? acceptedOffersWithTimes.reduce((sum, offer) => {
          const days = Math.abs(new Date(offer.acceptedAt!).getTime() - new Date(offer.sentAt!).getTime()) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / acceptedOffersWithTimes.length
      : 0;

    return NextResponse.json({
      overview: {
        totalOffers,
        acceptedOffers,
        rejectedOffers,
        pendingOffers,
        totalRevenue: totalRevenue._sum.total || 0,
        totalClients,
        winRate: Math.round(winRate * 100) / 100,
        lossRate: Math.round(lossRate * 100) / 100,
        averageOfferValue: Math.round(averageOfferValue * 100) / 100,
        averageConversionDays: Math.round(averageConversionDays * 100) / 100,
      },
      charts: {
        offersByStatus: offersByStatus.map(item => ({
          status: item.status,
          count: item._count.status,
        })),
        monthlyRevenue: monthlyRevenue,
        topClients: topClients,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}