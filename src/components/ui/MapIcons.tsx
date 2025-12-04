import { BedDouble, Camera, Car, Clock, Coffee, LucideIcon, MapPin, Utensils } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface IconConfig {
	icon:LucideIcon;
	defaultClass:string;
	color: string; // Hex color for static markup
	offsetY?: number; // Vertical offset in pixels (negative moves up)
}

const ICON_MAP : Record<string, IconConfig> = {
	food:{ icon: Utensils, defaultClass:"text-orange-500", color: "#f97316"},
	cafe:{ icon: Coffee, defaultClass:"text-amber-700", color: "#b45309"},
	stay:{ icon: BedDouble, defaultClass:"text-indigo-500", color: "#6366f1"},
	move:{ icon: Car, defaultClass:"text-slate-500", color: "#64748b", offsetY: -2}, // Car 아이콘을 살짝 위로 보정
	sightseeing:{ icon: Camera, defaultClass:"text-blue-500", color: "#3b82f6"},
}

const DEFAULT_CONFIG:IconConfig = {
	icon:MapPin,
	defaultClass:"text-gray-400",
	color: "#9ca3af"
}

export const getIconByType = (type: string, size?:number, className?:string, color?:string) => {
	const config= ICON_MAP[type] || DEFAULT_CONFIG;
	const IconComponent = config.icon;

	const mergedClass = twMerge(config.defaultClass, className)
	
	// offsetY가 있으면 스타일로 적용
	const style = config.offsetY ? { transform: `translateY(${config.offsetY}px)` } : undefined;

	// color prop을 전달하여 static markup에서도 색상이 유지되도록 함
	return <IconComponent size={size || 18} className={mergedClass} color={color ||config.color} style={style} />
}