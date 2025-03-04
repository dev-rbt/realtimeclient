import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Receipt, Clock, FileText, Users, Table, LayoutGrid } from "lucide-react";
import { useState } from "react";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyCode: string;
  type: "successful" | "failed" | "processing";
}

const documentTypes = [
  { id: "sales", name: "Satışlar", icon: <Receipt className="h-5 w-5" />, count: 0 },
  { id: "access_logs", name: "Erişim Logları", icon: <Clock className="h-5 w-5" />, count: 0 },
  { id: "return_sales", name: "İade Satışlar", icon: <FileText className="h-5 w-5" />, count: 0 },
  { id: "employees", name: "Çalışanlar", icon: <Users className="h-5 w-5" />, count: 0 },
  { id: "table_plans", name: "Masa Planları", icon: <Table className="h-5 w-5" />, count: 0 },
  { id: "table_groups", name: "Masa Grupları", icon: <LayoutGrid className="h-5 w-5" />, count: 0 },
];

export function TransactionDetailsModal({
  isOpen,
  onClose,
  companyCode,
  type,
}: TransactionDetailsModalProps) {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const getStatusColor = (type: "successful" | "failed" | "processing") => {
    switch (type) {
      case "successful":
        return "bg-green-50 text-green-700 border-green-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      case "processing":
        return "bg-orange-50 text-orange-700 border-orange-200";
    }
  };

  const getStatusTitle = (type: "successful" | "failed" | "processing") => {
    switch (type) {
      case "successful":
        return "Başarılı";
      case "failed":
        return "Başarısız";
      case "processing":
        return "İşlenen";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{companyCode}</h2>
              <p className="text-muted-foreground">
                {getStatusTitle(type)} Dökümanlar
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full border ${getStatusColor(type)}`}>
              {getStatusTitle(type)}
            </div>
          </div>

          {/* Document Type Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {documentTypes.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDocument(doc.id === selectedDocument ? null : doc.id)}
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  selectedDocument === doc.id
                    ? "bg-blue-50 border-blue-200 shadow-inner"
                    : "bg-card hover:bg-card/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">{doc.icon}</div>
                  <div className="text-left">
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.count} adet</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Details Table - Will be implemented later */}
          {selectedDocument && (
            <div className="border rounded-lg p-4">
              <p className="text-muted-foreground">Detay tablosu burada görünecek</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
