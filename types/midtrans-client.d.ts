declare module "midtrans-client" {
	export interface CoreApiOptions {
		isProduction: boolean;
		serverKey: string | undefined;
		clientKey: string | undefined;
	}

	export interface TransactionDetails {
		order_id: string;
		gross_amount: number;
	}

	export interface ItemDetails {
		id: string;
		price: number;
		quantity: number;
		name: string;
	}

	export interface CustomerDetails {
		first_name: string;
		last_name: string;
		email: string;
		phone: string;
	}

	export interface ChargeRequest {
		// payment_type: string;
		transaction_details: TransactionDetails;
		item_details?: ItemDetails[];
		customer_details?: CustomerDetails;
	}

	export interface ChargeResponse {
		status_code: string;
		status_message: string;
		transaction_id: string;
		order_id: string;
		gross_amount: string;
		payment_type: string;
		transaction_time: string;
		transaction_status: string;
		fraud_status: string;
		approval_code?: string;
		signature_key: string;
	}

	export class CoreApi {
		constructor(options: CoreApiOptions);
		charge(request: ChargeRequest): Promise<ChargeResponse>;
	}

	export class Snap {
		constructor(options: CoreApiOptions);
		createTransaction(request: ChargeRequest): Promise<ChargeResponse>;
		createTransactionToken(
			request: ChargeRequest
		): Promise<{ token: string }>;
		createTransactionRedirectUrl(
			request: ChargeRequest
		): Promise<{ redirect_url: string }>;
        transaction: {
            notification: (body: string) =>  any;
        };
	}
}

// Midtrans Snap client-side interface
interface MidtransSnapResult {
	order_id: string;
	transaction_status: string;
	fraud_status?: string;
}

interface MidtransSnapCallbacks {
	onSuccess: (result: MidtransSnapResult) => void;
	onPending: (result?: MidtransSnapResult) => void;
	onError: (result: MidtransSnapResult) => void;
	onClose: () => void;
}

interface MidtransSnap {
	pay: (token: string, callbacks: MidtransSnapCallbacks) => void;
}

interface Window {
	snap: MidtransSnap;
}
