import { BedDouble, Camera, Car, Clock, Coffee, LucideIcon, MapPin, Utensils } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface IconConfig {
	icon:LucideIcon;
	defaultClass:string;
}

const ICON_MAP : Record<string, IconConfig> = {
	food:{ icon: Utensils, defaultClass:"text-orange-500"},
	cafe:{ icon: Coffee, defaultClass:"text-amber-700"},
	stay:{ icon: BedDouble, defaultClass:"text-indigo-500"},
	move:{ icon: Car, defaultClass:"text-slate-500"},
	sightseeing:{ icon: Camera, defaultClass:"text-blue-500"},
}

const DEFAULT_CONFIG:IconConfig = {
	icon:MapPin,
	defaultClass:"Text-gray-400"
}

export const getIconByType = (type: string, size:number = 18, className?:string) => {
	const config= ICON_MAP[type] || DEFAULT_CONFIG;
	const IconComponent = config.icon;

	const mergedClass = twMerge(config.defaultClass, className)
	return <IconComponent size={size} className={mergedClass} />
}