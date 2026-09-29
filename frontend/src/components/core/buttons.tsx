import { MouseEventHandler } from 'react';

interface IbuttonProps {
  text: string;
  className?: string;
  actionHandler?: MouseEventHandler<HTMLButtonElement>;
}
export const CommonButton = (props: IbuttonProps) => {
  return (
    <button className={props.className} onClick={props.actionHandler}>
      {props.text}
    </button>
  );
};
