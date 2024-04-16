export type SendTextRequest = {
    receiver_id: string;
    talk_type: number;
    text:string;
  }

export interface MessagePublishRequest {
    type: string;
    talk_type:string;
    receiver_id:string;
    upload_id: string;
    content: string;
    width:number
    height:number
    url:string
    size:number
    quote_id: string;
    mentions: any[];
    receiver: {
      receiver_id: string;
      talk_type: number;
    };
  }
