-- CreateTable
CREATE TABLE "tournament_results" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "event_id" INTEGER,
    "place" INTEGER NOT NULL,
    "player_name" TEXT NOT NULL,
    "player_name_ko" TEXT,
    "country" TEXT,
    "prize" DECIMAL(15,2),
    "prize_text" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournament_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tournament_results_tournament_id_idx" ON "tournament_results"("tournament_id");

-- CreateIndex
CREATE INDEX "tournament_results_event_id_idx" ON "tournament_results"("event_id");

-- AddForeignKey
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_results" ADD CONSTRAINT "tournament_results_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
