import type { Route } from "./+types/home";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BACKEND_URL, TOKEN_EXPIRED } from "~/constant";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Login | IOT Kamar Mandi" }, { name: "IOT Kamar Mandi", content: "Login" }];
}

export default function page() {
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [data, setData] = useState({
		username: "",
		password: "",
	});

	useEffect(() => {
		if (typeof window !== "undefined") {
			const accessToken = Cookies.get("token");
			if (accessToken) {
				navigate("/dashboard");
			}
		}
	}, [navigate]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setData({ ...data, [event.target.name]: event.target.value });
	};

	const handlerLogin = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true);
		setError("");
		try {
			const response = await fetch(`${BACKEND_URL}/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});
			if (!response.ok) throw new Error("Unauthorized");
			const result = await response.json();
			if (!result.success) {
				setError(result.message);
				return;
			}
			const token = result.data.token;
			Cookies.set("token", token, { expires: TOKEN_EXPIRED });
			navigate("/dashboard");
			setError("");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-slate-800">
			<div className="w-full max-w-sm">
				<div className={cn("flex flex-col gap-6")}>
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">Masuk</CardTitle>
							<CardDescription>Masukkan email dan password di bawah ini untuk masuk ke akun Anda</CardDescription>
							{Boolean(error) && <p className="text-sm mt-4 bg-red-200 font-medium text-red-600 p-4 rounded">{error}</p>}
						</CardHeader>
						<CardContent>
							<form
								method="post"
								onSubmit={handlerLogin}
							>
								<div className="flex flex-col gap-6">
									<div className="grid gap-2">
										<Label htmlFor="username">Username</Label>
										<Input
											type="text"
											id="username"
											name="username"
											// placeholder="•••••••••••••"
											onChange={handleChange}
											disabled={isLoading}
											required
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="password">Password</Label>
										<Input
											id="password"
											type="password"
											name="password"
											onChange={handleChange}
											// placeholder="•••••••••••••"
											disabled={isLoading}
											required
										/>
									</div>
									<Button
										type="submit"
										className="w-full bg-slate-800 hover:cursor-pointer hover:bg-slate-700"
										disabled={isLoading}
									>
										Masuk
									</Button>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
