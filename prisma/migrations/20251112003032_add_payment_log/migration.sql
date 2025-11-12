-- CreateTable
CREATE TABLE "PaymentLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "tier" TEXT,
    "paymentMethod" TEXT NOT NULL DEFAULT 'RAZORPAY',
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "refundId" TEXT,
    "refundAmount" DOUBLE PRECISION,
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentLog_userId_idx" ON "PaymentLog"("userId");

-- CreateIndex
CREATE INDEX "PaymentLog_orderId_idx" ON "PaymentLog"("orderId");

-- CreateIndex
CREATE INDEX "PaymentLog_paymentId_idx" ON "PaymentLog"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentLog_status_idx" ON "PaymentLog"("status");

-- AddForeignKey
ALTER TABLE "PaymentLog" ADD CONSTRAINT "PaymentLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
