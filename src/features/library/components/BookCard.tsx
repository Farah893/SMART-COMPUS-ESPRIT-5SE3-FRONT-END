import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useT } from "@/i18n";
import type { BookView } from "../types";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { BookActions } from "./BookActions";

interface BookCardProps {
  book: BookView;
  busy?: boolean;
  onBorrow: (book: BookView) => void;
  onReserve: (book: BookView) => void;
  onCancel: (book: BookView) => void;
}

/** Fiche d'ouvrage du catalogue : titre, auteur, catégorie, disponibilité et action principale. */
export function BookCard({ book, busy, onBorrow, onReserve, onCancel }: BookCardProps) {
  const t = useT();
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">
          {book.category} · {book.year}
        </p>
        <AvailabilityBadge book={book} />
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold leading-snug">
          <Link to={`/bibliotheque/livres/${book.id}`} className="rounded hover:underline">
            {book.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{t("lib.book.by", { author: book.author })}</p>
      </div>
      {book.available === 0 && book.waiting > 0 && <p className="text-xs text-muted-foreground">{t("lib.avail.queue", { count: book.waiting })}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/bibliotheque/livres/${book.id}`} aria-label={`${t("lib.book.details")} — ${book.title}`}>
            {t("lib.book.details")}
          </Link>
        </Button>
        <BookActions book={book} busy={busy} onBorrow={onBorrow} onReserve={onReserve} onCancel={onCancel} />
      </div>
    </Card>
  );
}
