import * as React from "react";
interface BadgeProps extends React.SVGProps<SVGGElement> {
    label: string;
    message: string;
}
export declare const Badge: React.FC<BadgeProps>;
export default Badge;
