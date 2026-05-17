-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('UPCOMING', 'ONGOING', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('GAME', 'STRUCTURE', 'FEATURE');

-- CreateTable
CREATE TABLE "brands" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ko" TEXT,
    "name_ja" TEXT,
    "logo_url" TEXT,
    "website_url" TEXT,
    "country_code" CHAR(2),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title_full" TEXT NOT NULL,
    "title_short" TEXT NOT NULL,
    "title_full_ko" TEXT,
    "title_full_ja" TEXT,
    "country_code" CHAR(2) NOT NULL,
    "city" TEXT NOT NULL,
    "venue_name" TEXT,
    "venue_address" TEXT,
    "venue_lat" DECIMAL(9,6),
    "venue_lng" DECIMAL(9,6),
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Tokyo',
    "poster_image_url" TEXT,
    "status" "TournamentStatus" NOT NULL DEFAULT 'UPCOMING',
    "description" TEXT,
    "description_ko" TEXT,
    "description_ja" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "order_no" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "name_ko" TEXT,
    "date" DATE NOT NULL,
    "registration_start" TEXT,
    "registration_close" TEXT,
    "buy_in_amount" DECIMAL(12,2),
    "buy_in_currency" CHAR(3) NOT NULL DEFAULT 'JPY',
    "buy_in_text" TEXT,
    "starting_stack" INTEGER,
    "gtd_amount" DECIMAL(15,2),
    "gtd_text" TEXT,
    "game_type" TEXT,
    "structure" TEXT,
    "re_entry" TEXT,
    "next_day_pct" DECIMAL(5,4),
    "level_duration" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ko" TEXT,
    "category" "TagCategory" NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_tags" (
    "event_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "event_tags_pkey" PRIMARY KEY ("event_id","tag_id")
);

-- CreateTable
CREATE TABLE "pubs" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ko" TEXT,
    "name_ja" TEXT,
    "country_code" CHAR(2) NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "address" TEXT,
    "address_ko" TEXT,
    "lat" DECIMAL(9,6),
    "lng" DECIMAL(9,6),
    "phone" TEXT,
    "website_url" TEXT,
    "instagram_url" TEXT,
    "hours" JSONB,
    "features" JSONB,
    "cover_image_url" TEXT,
    "description" TEXT,
    "description_ko" TEXT,
    "description_ja" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pub_images" (
    "id" SERIAL NOT NULL,
    "pub_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "order_no" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pub_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pub_reviews" (
    "id" SERIAL NOT NULL,
    "pub_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pub_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password_hash" TEXT,
    "provider" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "user_id" INTEGER NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id","tournament_id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "author_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tournaments_slug_key" ON "tournaments"("slug");

-- CreateIndex
CREATE INDEX "tournaments_brand_id_idx" ON "tournaments"("brand_id");

-- CreateIndex
CREATE INDEX "tournaments_start_date_idx" ON "tournaments"("start_date");

-- CreateIndex
CREATE INDEX "tournaments_status_idx" ON "tournaments"("status");

-- CreateIndex
CREATE INDEX "events_tournament_id_idx" ON "events"("tournament_id");

-- CreateIndex
CREATE INDEX "events_date_idx" ON "events"("date");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "tags_category_idx" ON "tags"("category");

-- CreateIndex
CREATE INDEX "event_tags_tag_id_idx" ON "event_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "pubs_slug_key" ON "pubs"("slug");

-- CreateIndex
CREATE INDEX "pubs_city_idx" ON "pubs"("city");

-- CreateIndex
CREATE INDEX "pub_images_pub_id_idx" ON "pub_images"("pub_id");

-- CreateIndex
CREATE INDEX "pub_reviews_pub_id_idx" ON "pub_reviews"("pub_id");

-- CreateIndex
CREATE INDEX "pub_reviews_user_id_idx" ON "pub_reviews"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "favorites_tournament_id_idx" ON "favorites"("tournament_id");

-- CreateIndex
CREATE INDEX "notices_published_at_idx" ON "notices"("published_at");

-- AddForeignKey
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tags" ADD CONSTRAINT "event_tags_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tags" ADD CONSTRAINT "event_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pub_images" ADD CONSTRAINT "pub_images_pub_id_fkey" FOREIGN KEY ("pub_id") REFERENCES "pubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pub_reviews" ADD CONSTRAINT "pub_reviews_pub_id_fkey" FOREIGN KEY ("pub_id") REFERENCES "pubs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pub_reviews" ADD CONSTRAINT "pub_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
