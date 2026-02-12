import { Document, Page, Text, View, StyleSheet, PDFViewer, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  offerNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  clientInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
  },
  clientLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 3,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  clientValue: {
    fontSize: 12,
    color: '#1f2937',
    marginBottom: 8,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitlePdf: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 15,
  },
  articleContainer: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#fafafa',
    border: '1 solid #e5e7eb',
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  articleName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  articleTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  articleDescription: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 8,
  },
  articleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    color: '#6b7280',
  },
  pricingSummary: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
    border: '1 solid #e5e7eb',
  },
  pricingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  pricingValue: {
    fontSize: 11,
    color: '#1f2937',
  },
  pricingTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1 solid #e5e7eb',
  },
  pricingTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  pricingTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #e5e7eb',
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
  validUntil: {
    fontSize: 10,
    color: '#dc2626',
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

interface Article {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  discountPercent: number;
  total: number;
}

interface OfferSection {
  id: string;
  title: string;
  description: string;
  articles: Article[];
}

interface OfferData {
  id: string;
  offerNumber: string;
  title: string;
  status: string;
  currency: string;
  validUntil: string;
  subtotal: number;
  discountTotal: number;
  vatTotal: number;
  total: number;
  createdAt: string;
  client: {
    companyName: string;
    email: string;
    phone?: string;
  };
  sections: OfferSection[];
  companyInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

const formatCurrency = (amount: number, currency: string = 'EUR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// PDF Document Component
const OfferPDFDocument: React.FC<{ offer: OfferData }> = ({ offer }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{offer.title}</Text>
        <Text style={styles.offerNumber}>{offer.offerNumber}</Text>
        <Text style={styles.validUntil}>
          Valid until: {formatDate(offer.validUntil)}
        </Text>
      </View>

      {/* Client Information */}
      <View style={styles.clientInfo}>
        <Text style={styles.clientLabel}>Client</Text>
        <Text style={styles.clientValue}>{offer.client.companyName}</Text>
        <Text style={styles.clientValue}>{offer.client.email}</Text>
        {offer.client.phone && (
          <Text style={styles.clientValue}>{offer.client.phone}</Text>
        )}
      </View>

      {/* Offer Sections */}
      {offer.sections.map((section) => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionTitlePdf}>{section.title}</Text>
          {section.description && (
            <Text style={styles.sectionDescription}>{section.description}</Text>
          )}
          
          {section.articles.map((article) => (
            <View key={article.id} style={styles.articleContainer}>
              <View style={styles.articleHeader}>
                <Text style={styles.articleName}>{article.name}</Text>
                <Text style={styles.articleTotal}>
                  {formatCurrency(article.total, offer.currency)}
                </Text>
              </View>
              
              {article.description && (
                <Text style={styles.articleDescription}>{article.description}</Text>
              )}
              
              <View style={styles.articleDetails}>
                <Text>Quantity: {article.quantity} {article.unit}</Text>
                <Text>Unit Price: {formatCurrency(article.unitPrice, offer.currency)}</Text>
                <Text>VAT: {article.vatRate}%</Text>
                {article.discountPercent > 0 && (
                  <Text>Discount: {article.discountPercent}%</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      ))}

      {/* Pricing Summary */}
      <View style={styles.pricingSummary}>
        <Text style={styles.pricingTitle}>Pricing Summary</Text>
        
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>Subtotal</Text>
          <Text style={styles.pricingValue}>
            {formatCurrency(offer.subtotal, offer.currency)}
          </Text>
        </View>
        
        {offer.discountTotal > 0 && (
          <View style={styles.pricingRow}>
            <Text style={[styles.pricingLabel, { color: '#dc2626' }]}>Discount</Text>
            <Text style={[styles.pricingValue, { color: '#dc2626' }]}>
              -{formatCurrency(offer.discountTotal, offer.currency)}
            </Text>
          </View>
        )}
        
        <View style={styles.pricingRow}>
          <Text style={styles.pricingLabel}>VAT</Text>
          <Text style={styles.pricingValue}>
            {formatCurrency(offer.vatTotal, offer.currency)}
          </Text>
        </View>
        
        <View style={styles.pricingTotal}>
          <Text style={styles.pricingTotalLabel}>Total</Text>
          <Text style={styles.pricingTotalValue}>
            {formatCurrency(offer.total, offer.currency)}
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Generated on {new Date().toLocaleDateString()}</Text>
        {offer.companyInfo && (
          <>
            <Text>{offer.companyInfo.name}</Text>
            <Text>{offer.companyInfo.email} | {offer.companyInfo.phone}</Text>
            <Text>{offer.companyInfo.address}</Text>
          </>
        )}
      </View>
    </Page>
  </Document>
);

// Function to generate and download PDF
export const generateOfferPDF = async (offer: OfferData) => {
  try {
    const blob = await pdf(<OfferPDFDocument offer={offer} />).toBlob();
    const fileName = `${offer.offerNumber}_${offer.client.companyName.replace(/\s+/g, '_')}.pdf`;
    saveAs(blob, fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

// React component for PDF preview
export const PDFPreview: React.FC<{ offer: OfferData }> = ({ offer }) => (
  <PDFViewer style={{ width: '100%', height: '600px' }}>
    <OfferPDFDocument offer={offer} />
  </PDFViewer>
);

export default OfferPDFDocument;