import { Outlet } from "react-router-dom";
import SubscriptionGuard from "./subscriptionGuard";

export default function ProtectedLayout() {
  return (
    <>
      <SubscriptionGuard />
      <Outlet /> {/* This is where Dashboard, Settings, etc., will render */}
    </>
  );
}