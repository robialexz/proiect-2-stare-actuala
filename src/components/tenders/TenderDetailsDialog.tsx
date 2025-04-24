import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Tender, TenderDocument, TenderNote } from "@/models/tender";
import { useTenders } from "@/hooks/useTenders";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar,
  Building,
  MapPin,
  Tag,
  Star,
  StarOff,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  Download,
  Bell,
  BellOff,
  ThumbsUp,
  ThumbsDown,
  User,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TenderDetailsDialogProps {
  tender: Tender;
  open: boolean;
  onClose: () => void;
}

/**
 * Dialog pentru afișarea detaliilor unei licitații
 */
export default function TenderDetailsDialog({
  tender,
  open,
  onClose,
}: TenderDetailsDialogProps) {
  const { t } = useTranslation();
  const {
    notes,
    loadingNotes,
    isSubscribed,
    loadingSubscription,
    loadNotes,
    addNote,
    checkSubscription,
    toggleSubscription,
    toggleFavorite,
    toggleRelevant,
    downloadDocument,
  } = useTenders();
  const [activeTab, setActiveTab] = useState("details");
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Încărcăm notele și verificăm abonamentul când se deschide dialogul
  useEffect(() => {
    if (open && tender) {
      loadNotes(tender.id);
      checkSubscription(tender.id);
    }
  }, [open, tender, loadNotes, checkSubscription]);

  /**
   * Adaugă o notă nouă
   */
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setSubmittingNote(true);
    const success = await addNote(tender.id, newNote);
    setSubmittingNote(false);

    if (success) {
      setNewNote("");
    }
  };

  /**
   * Obține clasa CSS pentru badge-ul de status
   */
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100";
      case "awarded":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      default:
        return "";
    }
  };

  /**
   * Obține iconul pentru badge-ul de status
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "closed":
        return <XCircle className="h-3 w-3 mr-1" />;
      case "awarded":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "cancelled":
        return <XCircle className="h-3 w-3 mr-1" />;
      case "draft":
        return <FileText className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  /**
   * Obține inițialele din email
   */
  const getInitials = (email: string) => {
    if (!email) return "?";
    const parts = email.split("@")[0].split(/[._-]/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{tender.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {t("tenders.details.reference", "Referință")}: {tender.reference_number}
              </DialogDescription>
            </div>
            <Badge
              className={`flex items-center ${getStatusBadgeClass(
                tender.status
              )}`}
            >
              {getStatusIcon(tender.status)}
              {t(`tenders.status.${tender.status}`, tender.status)}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="details">
              {t("tenders.details.tabs.details", "Detalii")}
            </TabsTrigger>
            <TabsTrigger value="documents">
              {t("tenders.details.tabs.documents", "Documente")}
              {tender.documents && tender.documents.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {tender.documents.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="notes">
              {t("tenders.details.tabs.notes", "Note")}
              {notes.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {notes.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="details" className="m-0">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {t("tenders.details.generalInfo", "Informații generale")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          {t("tenders.details.description", "Descriere")}
                        </h4>
                        <p className="text-sm">{tender.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            {t("tenders.details.publicationDate", "Dată publicare")}
                          </h4>
                          <p className="text-sm flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(tender.publication_date)}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            {t("tenders.details.closingDate", "Dată închidere")}
                          </h4>
                          <p className="text-sm flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(tender.closing_date)}
                          </p>
                        </div>
                      </div>

                      {tender.estimated_value && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            {t("tenders.details.estimatedValue", "Valoare estimată")}
                          </h4>
                          <p className="text-sm flex items-center">
                            <Tag className="h-4 w-4 mr-1" />
                            {formatCurrency(
                              tender.estimated_value,
                              tender.currency || "RON"
                            )}
                          </p>
                        </div>
                      )}

                      {tender.cpv_code && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            {t("tenders.details.cpvCode", "Cod CPV")}
                          </h4>
                          <p className="text-sm">
                            {tender.cpv_code}
                            {tender.cpv_description && (
                              <span className="ml-1 text-muted-foreground">
                                ({tender.cpv_description})
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {t("tenders.details.authorityInfo", "Informații autoritate")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          {t(
                            "tenders.details.contractingAuthority",
                            "Autoritate contractantă"
                          )}
                        </h4>
                        <p className="text-sm flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {tender.contracting_authority}
                        </p>
                      </div>

                      {tender.authority_type && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            {t("tenders.details.authorityType", "Tip autoritate")}
                          </h4>
                          <p className="text-sm">{tender.authority_type}</p>
                        </div>
                      )}

                      {tender.location && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            {t("tenders.details.location", "Locație")}
                          </h4>
                          <p className="text-sm flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {tender.location}
                          </p>
                        </div>
                      )}

                      {tender.contact_person && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            {t("tenders.details.contactPerson", "Persoană de contact")}
                          </h4>
                          <p className="text-sm">{tender.contact_person}</p>
                        </div>
                      )}

                      {tender.contact_email && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            {t("tenders.details.contactEmail", "Email contact")}
                          </h4>
                          <p className="text-sm">
                            <a
                              href={`mailto:${tender.contact_email}`}
                              className="text-primary hover:underline"
                            >
                              {tender.contact_email}
                            </a>
                          </p>
                        </div>
                      )}

                      {tender.contact_phone && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-1">
                            {t("tenders.details.contactPhone", "Telefon contact")}
                          </h4>
                          <p className="text-sm">
                            <a
                              href={`tel:${tender.contact_phone}`}
                              className="text-primary hover:underline"
                            >
                              {tender.contact_phone}
                            </a>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {tender.url && (
                  <div className="flex justify-center">
                    <Button asChild>
                      <a
                        href={tender.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {t(
                          "tenders.details.viewOnPlatform",
                          "Vezi pe platforma {{source}}",
                          { source: tender.source }
                        )}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="m-0">
              {!tender.documents || tender.documents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {t(
                      "tenders.details.noDocuments",
                      "Nu există documente disponibile pentru această licitație"
                    )}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tender.documents.map((document: TenderDocument) => (
                    <Card key={document.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="font-medium">{document.name}</h4>
                          {document.description && (
                            <p className="text-sm text-muted-foreground">
                              {document.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {document.type.toUpperCase()}
                            </span>
                            {document.size && (
                              <span>
                                {(document.size / 1024).toFixed(0)} KB
                              </span>
                            )}
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(document.upload_date)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(document)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {t("tenders.details.download", "Descarcă")}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="notes" className="m-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder={t(
                      "tenders.details.addNoteHint",
                      "Adaugă o notă despre această licitație..."
                    )}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || submittingNote}
                    >
                      {submittingNote && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      <Send className="h-4 w-4 mr-2" />
                      {t("tenders.details.addNote", "Adaugă notă")}
                    </Button>
                  </div>
                </div>

                <Separator />

                {loadingNotes ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("tenders.details.loadingNotes", "Se încarcă notele...")}
                    </p>
                  </div>
                ) : notes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      {t(
                        "tenders.details.noNotes",
                        "Nu există note pentru această licitație"
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note: TenderNote) => (
                      <Card key={note.id}>
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {getInitials(note.user_id)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {note.user_id}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDate(note.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">
                            {note.content}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:mr-auto">
            <Button
              variant="outline"
              size="sm"
              className={tender.is_favorite ? "text-yellow-500" : ""}
              onClick={() => toggleFavorite(tender.id, !tender.is_favorite)}
            >
              {tender.is_favorite ? (
                <>
                  <Star className="h-4 w-4 mr-2 fill-current" />
                  {t("tenders.details.removeFromFavorites", "Elimină de la favorite")}
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  {t("tenders.details.addToFavorites", "Adaugă la favorite")}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={tender.is_relevant ? "text-green-500" : ""}
              onClick={() => toggleRelevant(tender.id, !tender.is_relevant)}
            >
              {tender.is_relevant ? (
                <>
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {t("tenders.details.markAsIrrelevant", "Marchează ca irelevant")}
                </>
              ) : (
                <>
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  {t("tenders.details.markAsRelevant", "Marchează ca relevant")}
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loadingSubscription}
              onClick={() => toggleSubscription(tender.id)}
            >
              {loadingSubscription ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : isSubscribed ? (
                <BellOff className="h-4 w-4 mr-2" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              {isSubscribed
                ? t("tenders.details.unsubscribe", "Dezabonează-te")
                : t("tenders.details.subscribe", "Abonează-te")}
            </Button>

            <Button onClick={onClose}>
              {t("tenders.details.close", "Închide")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
