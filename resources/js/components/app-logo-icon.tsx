import logoUrl from '@/assets/logo_dark.png';
import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return <img src={logoUrl} alt="Logo" className={`${className || ''} object-contain`} {...props} />;
}
