import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  header: { fontSize: 20, marginBottom: 10 },
  tableRow: { flexDirection: "row" },
  cell: { flex: 1, padding: 5, borderWidth: 1 },
});

const MyTemplate = () => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.header}>Invoice</Text>
      <View style={styles.section}>
        <Text>Customer: John Doe</Text>
        <Text>Date: 2025-07-25</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={styles.cell}>Item</Text>
        <Text style={styles.cell}>Qty</Text>
        <Text style={styles.cell}>Price</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={styles.cell}>Product A</Text>
        <Text style={styles.cell}>2</Text>
        <Text style={styles.cell}>$20</Text>
      </View>
    </Page>
  </Document>
);

export default function Test() {
  return (
    <div>
      <PDFDownloadLink document={<MyTemplate />} fileName="invoice.pdf">
        {({ loading }) => (loading ? "Loading..." : "Download Invoice")}
      </PDFDownloadLink>
    </div>
  );
}
