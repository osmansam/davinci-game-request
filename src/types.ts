export type OptionType = {
  value: string | number;
  label: string;
  imageUrl?: string;
  keywords?: string[];
  triggerExtraModal?: boolean;
  subText?: string;
};

export type FormElementsState = Record<string, unknown>;

export type TagType<T = unknown> = {
  _id?: string | number;
  name: string;
} & T;

export type Role = {
  _id?: string | number;
  name: string;
  color?: string;
};
