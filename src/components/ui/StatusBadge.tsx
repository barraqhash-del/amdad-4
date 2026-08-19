import React from "react";
import { OrderStatus } from "../../types";
import { Clock, PackageCheck, Truck, CheckCircle2, XCircle, AlertCircle, MapPin } from "lucide-react";

interface Props {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<Props> = ({ status, size = "md" }) => {
  const getDetails = () => {
    switch (status) {
      case "RECEIVED":
        return {
          label: "تم استقبال الطلب",
          bg: "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300",
          icon: Clock,
        };
      case "PROCESSING":
        return {
          label: "قيد التحضير والتعبئة",
          bg: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-300",
          icon: PackageCheck,
        };
      case "READY_FOR_DISPATCH":
        return {
          label: "جاهز للشحن",
          bg: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300",
          icon: AlertCircle,
        };
      case "LOADED_FROM_FACTORY":
        return {
          label: "تم استلام الطلبية من المصنع 🏭",
          bg: "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300 font-bold",
          icon: PackageCheck,
        };
      case "OUT_FOR_DELIVERY":
        return {
          label: "قيد التوصيل 🚚",
          bg: "bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-950/50 dark:border-cyan-800 dark:text-cyan-300 animate-pulse font-bold",
          icon: Truck,
        };
      case "ARRIVED_AT_DESTINATION":
        return {
          label: "وصلت إلى موقع التسليم 📍",
          bg: "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/50 dark:border-purple-800 dark:text-purple-300 animate-pulse font-bold",
          icon: MapPin,
        };
      case "AWAITING_MERCHANT_CONFIRMATION":
        return {
          label: "بانتظار موافقة التاجر على التسليم ⏳",
          bg: "bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200 animate-pulse font-bold",
          icon: Clock,
        };
      case "DELIVERED":
        return {
          label: "تم التسليم للتاجر",
          bg: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300",
          icon: CheckCircle2,
        };
      case "CANCELLED":
        return {
          label: "ملغي",
          bg: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          bg: "bg-slate-50 border-slate-200 text-slate-700",
          icon: Clock,
        };
    }
  };

  const { label, bg, icon: Icon } = getDetails();

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
    lg: "text-base px-3 py-1.5 gap-2",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap shadow-xs ${bg} ${sizeClasses[size]}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"} />
      {label}
    </span>
  );
};
