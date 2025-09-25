import { pdfListResponse } from "./services/pdf-chat-bot.models";

export const pdfListData: pdfListResponse[] = [
  {
    id: 1,
    title: 'FMCSA ELD Final Rule',
    description: 'A legal document pertaining to Hours of Service.'
  },
  {
    id: 2,
    title: 'A Driver\'s Guide to Hours of Service',
    description: 'A guide for drivers on Hours of Service.'
  }
];


export const pdfDetailData1 = {
  url: 'FMCSA-ELD-Final-Rule_12-10-2015.pdf',
}

export const pdfDetailData2 = {
  url: 'drivers_guide_to_HOS_2015_508.pdf',
}
