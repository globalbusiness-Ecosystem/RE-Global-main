'use client';

import { useState, useEffect } from 'react';
import { useWhatsApp } from '@/lib/whatsapp-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Download, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface ContractsPageProps {
  language?: 'en' | 'ar';
  onBack?: () => void;
}

const SAMPLE_CONTRACTS = [
  {
    id: 'buy_001',
    name: 'Property Purchase Agreement',
    description: 'Standard contract for property buying transactions',
    type: 'buy',
    status: 'active' as const,
    version: '2.1',
  },
  {
    id: 'rent_001',
    name: 'Rental Lease Agreement',
    description: 'Complete rental contract with 12-month terms',
    type: 'rent',
    status: 'active' as const,
    version: '2.0',
  },
  {
    id: 'invest_001',
    name: 'Investment Agreement',
    description: 'Real estate investment contract with ROI terms',
    type: 'invest',
    status: 'active' as const,
    version: '1.9',
  },
  {
    id: 'hotel_001',
    name: 'Hotel Booking Terms',
    description: 'Short-term accommodation agreement',
    type: 'hotel',
    status: 'active' as const,
    version: '2.2',
  },
];

export default function ContractsPage({ language = 'en', onBack }: ContractsPageProps) {
  const [selectedContract, setSelectedContract] = useState(SAMPLE_CONTRACTS[0].id);
  const [loading, setLoading] = useState(false);
  const { contactSupport } = useWhatsApp();

  const isArabic = language === 'ar';

  const texts = {
    en: {
      title: 'Smart Contracts',
      description: 'Browse and manage property contracts',
      overview: 'Overview',
      details: 'Details',
      backButton: 'Back',
      viewButton: 'View Contract',
      downloadButton: 'Download PDF',
      shareButton: 'Share via WhatsApp',
      requestButton: 'Request Custom',
      contractType: 'Contract Type',
      version: 'Version',
      status: 'Status',
      updateDate: 'Last Updated',
      contractContent: 'Contract Content',
      loading: 'Loading contract...',
      shareSuccess: 'Shared via WhatsApp',
      downloadSuccess: 'Contract downloaded',
    },
    ar: {
      title: 'العقود الذكية',
      description: 'تصفح وإدارة عقود الممتلكات',
      overview: 'نظرة عامة',
      details: 'التفاصيل',
      backButton: 'العودة',
      viewButton: 'عرض العقد',
      downloadButton: 'تحميل PDF',
      shareButton: 'مشاركة عبر WhatsApp',
      requestButton: 'طلب عقد مخصص',
      contractType: 'نوع العقد',
      version: 'الإصدار',
      status: 'الحالة',
      updateDate: 'آخر تحديث',
      contractContent: 'محتوى العقد',
      loading: 'جاري تحميل العقد...',
      shareSuccess: 'تم المشاركة عبر WhatsApp',
      downloadSuccess: 'تم تحميل العقد',
    },
  };

  const t = isArabic ? texts.ar : texts.en;

  const currentContract = SAMPLE_CONTRACTS.find((c) => c.id === selectedContract);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Simulate download
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(t.downloadSuccess);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!currentContract) return;

    setLoading(true);
    try {
      const message = `RE Platform Contract: ${currentContract.name} (v${currentContract.version}). This is a ${currentContract.type} contract. Please review and contact us for more details.`;
      await contactSupport(message, 'User');
      toast.success(t.shareSuccess);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-background p-4 pb-24 ${isArabic ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" />
            <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
          </div>
          <p className="text-muted-foreground">{t.description}</p>
        </div>

        {/* Contract List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_CONTRACTS.map((contract) => (
            <Card
              key={contract.id}
              className={`cursor-pointer transition ${
                selectedContract === contract.id
                  ? 'border-accent bg-accent/5'
                  : 'border-border hover:border-accent/50'
              }`}
              onClick={() => setSelectedContract(contract.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{contract.name}</CardTitle>
                    <CardDescription>{contract.description}</CardDescription>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.version}:</span>
                  <span className="font-medium">{contract.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t.status}:</span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded text-xs font-medium">
                    {contract.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contract Details */}
        {currentContract && (
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{currentContract.name}</CardTitle>
                  <CardDescription>{currentContract.description}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">{t.overview}</TabsTrigger>
                  <TabsTrigger value="details">{t.details}</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="text-sm text-muted-foreground mb-1">{t.contractType}</p>
                      <p className="font-semibold capitalize">{currentContract.type}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-background border border-border">
                      <p className="text-sm text-muted-foreground mb-1">{t.version}</p>
                      <p className="font-semibold">{currentContract.version}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                    <div className="flex gap-2 items-start">
                      <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Contract Status</p>
                        <p className="text-sm text-muted-foreground">
                          This contract is active and ready for use. All terms are finalized and legally reviewed.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold mb-2">Key Provisions:</p>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        <li>Party identification and legal representation</li>
                        <li>Property description and specifications</li>
                        <li>Payment terms and conditions</li>
                        <li>Timeline and milestones</li>
                        <li>Dispute resolution mechanisms</li>
                        <li>Applicable laws and jurisdiction</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Actions */}
              <div className="flex gap-2 mt-6 pt-6 border-t border-border">
                <Button
                  onClick={handleDownload}
                  disabled={loading}
                  className="flex-1 gap-2"
                  variant="outline"
                >
                  <Download className="w-4 h-4" />
                  {t.downloadButton}
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={loading}
                  className="flex-1 gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {t.shareButton}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full"
          >
            {t.backButton}
          </Button>
        )}
      </div>
    </div>
  );
}
