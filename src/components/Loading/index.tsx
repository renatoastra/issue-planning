import { RotatingLines } from "react-loader-spinner";

interface LoadingSpinnerProps {
  isLoading?: boolean;
  text: string;
}

export const LoadingSpinner = ({ isLoading, text }: LoadingSpinnerProps) => {
  return (
    <>
      {isLoading ? (
        <RotatingLines
          strokeColor="grey"
          strokeWidth="5"
          animationDuration="0.75"
          width="26"
          visible={true}
        />
      ) : (
        <p>{text}</p>
      )}
    </>
  );
};
