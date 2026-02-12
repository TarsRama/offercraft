// Mock Prisma client for development without database
interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'TENANT_ADMIN' | 'MANAGER' | 'VIEWER';
  tenantId: string;
  password: string;
  isActive: boolean;
  avatar?: string | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MockTenant {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data
const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    email: 'admin@demo.com',
    firstName: 'Admin',
    lastName: 'Demo',
    role: 'TENANT_ADMIN',
    tenantId: 'tenant-1',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/QwGd3k9Z8uR7F9Xl2', // password123
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const mockTenants: MockTenant[] = [
  {
    id: 'tenant-1',
    name: 'Demo Company',
    slug: 'demo-company',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

// Mock clients data
const mockClients: any[] = [
  {
    id: 'client-1',
    tenantId: 'tenant-1',
    companyName: 'Acme Corp',
    email: 'contact@acme.com',
    phone: '+1 (555) 123-4567',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'client-2',
    tenantId: 'tenant-1',
    companyName: 'TechStart Inc',
    email: 'hello@techstart.com',
    phone: '+1 (555) 234-5678',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'client-3',
    tenantId: 'tenant-1',
    companyName: 'BuildRight LLC',
    email: 'info@buildright.com',
    phone: '+1 (555) 345-6789',
    status: 'LEAD',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockPrisma = {
  user: {
    findFirst: async ({ where, include }: any) => {
      const user = mockUsers.find(u => u.email === where?.email && (!where?.isActive || u.isActive));
      if (!user) return null;
      
      return {
        ...user,
        tenant: include?.tenant ? mockTenants.find(t => t.id === user.tenantId) : undefined,
      };
    },
    findUnique: async ({ where, include }: any) => {
      const user = mockUsers.find(u => u.id === where?.id || u.email === where?.email);
      if (!user) return null;
      
      return {
        ...user,
        tenant: include?.tenant ? mockTenants.find(t => t.id === user.tenantId) : undefined,
      };
    },
    update: async ({ where, data }: any) => {
      const userIndex = mockUsers.findIndex(u => u.id === where?.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...data, updatedAt: new Date() };
        return mockUsers[userIndex];
      }
      return null;
    },
    create: async (data: any) => {
      const newUser: MockUser = {
        id: `user-${Date.now()}`,
        email: data.data?.email || data.email,
        firstName: data.data?.firstName || data.firstName,
        lastName: data.data?.lastName || data.lastName,
        role: (data.data?.role || data.role || 'USER') as any,
        tenantId: data.data?.tenantId || data.tenantId,
        password: data.data?.password || data.password,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.push(newUser);
      return newUser;
    },
  },
  tenant: {
    findFirst: async ({ where }: any) => {
      return mockTenants.find(t => t.slug === where?.slug) || null;
    },
    findUnique: async ({ where }: any) => {
      return mockTenants.find(t => t.slug === where?.slug || t.id === where?.id) || null;
    },
    create: async (data: any) => {
      const newTenant: MockTenant = {
        id: `tenant-${Date.now()}`,
        name: data.data?.name || data.name,
        slug: data.data?.slug || data.slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockTenants.push(newTenant);
      return newTenant;
    },
  },
  offer: {
    findMany: async ({ where }: any) => {
      return []; // Empty array for now
    },
    count: async ({ where }: any) => {
      return 0;
    },
    create: async (data: any) => {
      return {
        id: `offer-${Date.now()}`,
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
  },
  client: {
    findMany: async ({ where, include }: any) => {
      let filteredClients = mockClients.filter(c => 
        !where?.tenantId || c.tenantId === where.tenantId
      );

      if (where?.status) {
        filteredClients = filteredClients.filter(c => c.status === where.status);
      }

      if (where?.OR) {
        const searchTerm = where.OR[0]?.companyName?.contains?.toLowerCase();
        if (searchTerm) {
          filteredClients = filteredClients.filter(c => 
            c.companyName.toLowerCase().includes(searchTerm) ||
            c.email?.toLowerCase().includes(searchTerm)
          );
        }
      }

      return filteredClients.map(client => ({
        ...client,
        contacts: include?.contacts ? [] : undefined,
        addresses: include?.addresses ? [] : undefined,
        offers: include?.offers ? [] : undefined,
      }));
    },
    count: async ({ where }: any) => {
      let filteredClients = mockClients.filter(c => 
        !where?.tenantId || c.tenantId === where.tenantId
      );

      if (where?.status) {
        filteredClients = filteredClients.filter(c => c.status === where.status);
      }

      return filteredClients.length;
    },
    create: async (data: any) => {
      const newClient = {
        id: `client-${Date.now()}`,
        tenantId: data.data?.tenantId || data.tenantId,
        companyName: data.data?.companyName || data.companyName,
        email: data.data?.email || data.email,
        phone: data.data?.phone || data.phone,
        status: data.data?.status || data.status || 'LEAD',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockClients.push(newClient);
      return newClient;
    },
  },
  offerSection: {
    create: async (data: any) => {
      return {
        id: `section-${Date.now()}`,
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    createMany: async (data: any) => {
      return { count: data.data?.length || 0 };
    },
  },
  article: {
    create: async (data: any) => {
      return {
        id: `article-${Date.now()}`,
        ...data.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },
    createMany: async (data: any) => {
      return { count: data.data?.length || 0 };
    },
  },
  offerActivity: {
    create: async (data: any) => {
      return {
        id: `activity-${Date.now()}`,
        ...data.data,
        createdAt: new Date(),
      };
    },
  },
  clientContact: {
    createMany: async (data: any) => {
      return { count: data.data?.length || 0 };
    },
  },
  clientAddress: {
    createMany: async (data: any) => {
      return { count: data.data?.length || 0 };
    },
  },
  $transaction: async (operations: any) => {
    // Mock transaction - execute operations sequentially
    if (typeof operations === 'function') {
      // Function-based transaction
      const tx = {
        user: mockPrisma.user,
        tenant: mockPrisma.tenant,
        offer: mockPrisma.offer,
        client: mockPrisma.client,
        offerSection: mockPrisma.offerSection,
        article: mockPrisma.article,
        offerActivity: mockPrisma.offerActivity,
        clientContact: mockPrisma.clientContact,
        clientAddress: mockPrisma.clientAddress,
      };
      return await operations(tx);
    } else {
      // Array-based transaction
      const results = [];
      for (const op of operations) {
        results.push(await op);
      }
      return results;
    }
  },
};