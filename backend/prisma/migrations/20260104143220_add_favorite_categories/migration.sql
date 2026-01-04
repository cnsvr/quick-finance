-- CreateTable
CREATE TABLE "favorite_categories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "favorite_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorite_categories_userId_type_order_idx" ON "favorite_categories"("userId", "type", "order");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_categories_userId_category_type_key" ON "favorite_categories"("userId", "category", "type");

-- AddForeignKey
ALTER TABLE "favorite_categories" ADD CONSTRAINT "favorite_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
