import { ButtonHTMLAttributes, DetailedHTMLProps, HTMLAttributes } from "react";

export type ReactButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;
export type ReactCanvasProps = DetailedHTMLProps<
  HTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & { height: number; width: number };
export type ReactDivProps = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
export type ReactVideoProps = DetailedHTMLProps<
  HTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
> & { autoPlay: boolean; playsInline: boolean; muted: boolean };

export type ReactProps =
  | ReactButtonProps
  | ReactCanvasProps
  | ReactDivProps
  | ReactVideoProps;
