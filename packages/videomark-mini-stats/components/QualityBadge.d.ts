import * as React from "react";
interface QualityBadgeProps extends React.SVGProps<SVGGElement> {
    label: string;
    quality: number;
}
export declare const QualityBadge: React.FC<QualityBadgeProps>;
export default QualityBadge;
