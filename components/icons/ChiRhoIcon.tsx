import ChiRhoSvg from '@/assets/images/chi-rho.svg';
import type { SvgProps } from 'react-native-svg';

type ChiRhoIconProps = SvgProps & {
  size?: number;
  opacity?: number;
};

export function ChiRhoIcon({
  size = 25,
  opacity = 1,
  ...props
}: ChiRhoIconProps) {
  return (
    <ChiRhoSvg
      width={size}
      height={size}
      opacity={opacity}
      {...props}
    />
  );
}