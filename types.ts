
export enum BoardType {
  CHALKBOARD = 'CHALKBOARD',
  WHITEBOARD = 'WHITEBOARD'
}

export interface BoardState {
  type: BoardType;
  text: string;
  color: string;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  boardWidth: number;
  boardHeight: number;
  fileUrl?: string;
  fileType?: string;
}

export interface GeminiResponse {
  suggestion: string;
  category: string;
}
