"use client";

import { useEffect, useState } from "react";

export function useSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/server")
      .then((res) => res.json())
      .then((data) => setIsSuperAdmin(data.status));
  }, []);

  return isSuperAdmin;
}
