import type { Route } from "./+types/home";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Aplikasi" }, { name: "IOT Kamar Mandi", content: "Selamat datang" }];
}

export default function page() {
	const navigate = useNavigate();
	useEffect(() => {
		navigate("/login");
	}, [navigate]);
	return null;
}
