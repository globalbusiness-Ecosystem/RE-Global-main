import { NextRequest, NextResponse } from 'next/server';

interface PaymentRequest {
  userId: string;
  amount: number;
  currency: 'PI' | 'USD';
  transactionType: 'buy' | 'rent' | 'hotel' | 'invest' | 'tokenized';
  propertyId: string;
  propertyTitle: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  success: boolean;
  paymentId: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  message?: string;
  error?: string;
}

// In-memory storage (replace with database in production)
const transactions: Record<string, any> = {};
const wallets: Record<string, any> = {};

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequest = await request.json();
    
    const {
      userId,
      amount,
      currency,
      transactionType,
      propertyId,
      propertyTitle,
      metadata = {}
    } = body;

    // Validate inputs
    if (!userId || !amount || !propertyId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userId, amount, propertyId' 
        },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Amount must be greater than 0' 
        },
        { status: 400 }
      );
    }

    // Initialize wallet if needed
    if (!wallets[userId]) {
      wallets[userId] = {
        userId,
        balance: 1000, // Mock initial balance
        currency: 'PI',
        totalSpent: 0,
        totalEarned: 0,
        createdAt: new Date().toISOString(),
        transactions: []
      };
    }

    const wallet = wallets[userId];

    // Check balance for purchases
    if (currency === 'PI' && wallet.balance < amount) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient balance in wallet',
          currentBalance: wallet.balance,
          requiredAmount: amount
        },
        { status: 402 }
      );
    }

    // Generate transaction ID
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).slice(7)}`;
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(7)}`;

    // Create transaction record
    const transaction = {
      transactionId,
      paymentId,
      userId,
      amount,
      currency,
      transactionType,
      propertyId,
      propertyTitle,
      status: 'completed',
      timestamp: new Date().toISOString(),
      metadata,
      description: `${transactionType.toUpperCase()}: ${propertyTitle}`
    };

    // Update wallet
    wallet.balance -= amount;
    wallet.totalSpent += amount;
    wallet.transactions.push(transaction);

    // Store transaction
    transactions[transactionId] = transaction;

    const response: PaymentResponse = {
      success: true,
      paymentId,
      transactionId,
      amount,
      currency,
      status: 'completed',
      timestamp: new Date().toISOString(),
      message: `Payment of ${amount} ${currency} processed successfully for ${propertyTitle}`
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[v0] Payment processing error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Payment processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const transactionType = request.nextUrl.searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const wallet = wallets[userId];
    if (!wallet) {
      return NextResponse.json(
        { 
          balance: 0, 
          currency: 'PI',
          totalSpent: 0,
          totalEarned: 0,
          transactions: []
        },
        { status: 200 }
      );
    }

    let filteredTransactions = wallet.transactions;
    if (transactionType) {
      filteredTransactions = wallet.transactions.filter(
        t => t.transactionType === transactionType
      );
    }

    return NextResponse.json({
      wallet: {
        userId: wallet.userId,
        balance: wallet.balance,
        currency: wallet.currency,
        totalSpent: wallet.totalSpent,
        totalEarned: wallet.totalEarned,
        createdAt: wallet.createdAt
      },
      transactions: filteredTransactions
    });

  } catch (error) {
    console.error('[v0] Wallet fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet' },
      { status: 500 }
    );
  }
}
