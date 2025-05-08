import * as React from "react";
import type { Route } from "./+types/home";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BACKEND_URL } from "~/constant";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { formatTanggal } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "~/components/ui/breadcrumb";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "~/components/ui/table";

export function meta({}: Route.MetaArgs) {
	return [{ title: "Dashboard | Monitoring Sawi Menggunakan Internet Of Things" }, { name: "Sawiku", content: "Dashboard" }];
}

interface ResponseApiType {
	id: number;
	createdAt: Date;
	sensors: {
		pintu: {
			type: "PINTU";
			value: "TERBUKA" | "TERTUTUP";
			createdAt: Date;
		}[];
		gerak: {
			type: "GERAK";
			value: "GERAK" | "DIAM";
			createdAt: Date;
		}[];
	};
}

const socket = io(BACKEND_URL, {
	transports: ["websocket"],
});

const chartConfigGerak = {
	kelembapanTanah: {
		label: "Gerak",
	},
	value: {
		label: "[1] Gerak\n[0] Diam",
		color: "#000000",
	},
} satisfies ChartConfig;

export default function Page() {
	const navigate = useNavigate();

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [data, setData] = useState<ResponseApiType[]>([]);
	const [lastPintu, setLastPintu] = useState<ResponseApiType["sensors"]["pintu"]>([]);
	const [lastGerak, setLastGerak] = useState<ResponseApiType["sensors"]["gerak"]>([]);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			if (typeof window === "undefined") return;
			const accessToken = Cookies.get("token");
			if (!accessToken) {
				navigate("/login");
				setIsLoading(false);
				return;
			}
			try {
				const response = await fetch(`${BACKEND_URL}/sensor`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});
				if (!response.ok) return;
				const result = await response.json();
				const resultData = result.data as ResponseApiType[];
				const dataLastPintu = resultData[0].sensors.pintu.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
				const dataLastGerak = resultData[0].sensors.gerak.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
				setData(resultData);
				setLastPintu(dataLastPintu);
				setLastGerak(dataLastGerak);
			} catch (error) {
				console.error("Error fetching data:", error);
				Cookies.remove("token");
				navigate("/login");
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();

		if (socket) {
			socket.on("get", (dataWs: ResponseApiType[]) => {
				const dataLastPintu = dataWs[0].sensors.pintu.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
				const dataLastGerak = dataWs[0].sensors.gerak.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
				setData(dataWs);
				setLastPintu(dataLastPintu);
				setLastGerak(dataLastGerak);
			});
		}

		return () => {
			if (socket) {
				socket.off("get");
			}
		};
	}, [navigate]);

	const handlerLogout = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true);
		setError("");
		try {
			Cookies.remove("token");
			navigate("/login");
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
			setData([]);
			setLastGerak([]);
		}
	};

	if (isLoading) return <p>Loading...</p>;

	return (
		<div className="bg-slate-800 min-h-svh pb-16 text-slate-50">
			<header className="flex sticky top-0 z-50 w-full items-center border-b border-b-slate-800 bg-slate-700">
				<div className="mx-auto w-[1200px] flex px-4 xl:px-0 h-12 items-center justify-between">
					<Breadcrumb className="block">
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink
									href="/dashboard"
									className="font-semibold text-slate-100 hover:text-slate-50"
								>
									Monitoring IOT Kemar Mandi
								</BreadcrumbLink>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
					<div className="flex gap-4 items-center">
						<Button
							onClick={handlerLogout}
							variant="destructive"
							className="hover:cursor-pointer"
						>
							Keluar
						</Button>
					</div>
				</div>
			</header>

			<div className="xl:w-[1200px] w-full xl:mx-auto grid gap-4 py-4 xl:px-0">
				<div className="px-4">
					<h1 className="font-semibold text-2xl">Dashboard Monitoring</h1>
					<p>Monitoring sensor IOT yang ada di dalam kamar mandi.</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4">
					{[
						{
							title: "Sensor Pintu",
							key: "PINTU",
							value: lastPintu[lastPintu.length - 1]?.value ?? "Loading...",
							date: lastPintu[lastPintu.length - 1]?.createdAt ? formatTanggal(new Date(lastPintu[lastPintu.length - 1].createdAt)) : "Loading...",
						},
						{
							title: "Sensor Gerak",
							key: "GERAK",
							value: lastGerak[lastGerak.length - 1]?.value ?? "Loading...",
							date: lastGerak[lastGerak.length - 1]?.createdAt ? formatTanggal(new Date(lastGerak[lastGerak.length - 1].createdAt)) : "Loading...",
						},
					].map((item, index) => (
						<Card
							key={index}
							className="@container/card bg-slate-700 border-slate-700"
						>
							<CardHeader className="relative">
								<CardDescription className="text-slate-50">{item.title}</CardDescription>
								<CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums text-slate-50">{item.value}</CardTitle>
							</CardHeader>
							<CardFooter className="flex-col items-start gap-1 text-sm text-slate-50">
								<div className="line-clamp-1 flex gap-2 font-medium">Terakhir diupdate:</div>
								<div className="text-slate-50">{item.date}</div>
							</CardFooter>
						</Card>
					))}
				</div>

				<div className="px-4">
					<Card className="@container/card bg-slate-700 border-slate-700">
						<CardHeader className="relative">
							<CardTitle className="text-slate-50">Pergerakan saat ini</CardTitle>
							<CardDescription className="text-slate-50">
								<span className="@[540px]/card:block">Di dalam kamar mandi</span>
							</CardDescription>
						</CardHeader>
						<CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
							<ChartContainer
								config={chartConfigGerak}
								className="aspect-auto h-[300px] w-full"
							>
								<AreaChart data={lastGerak.map((item) => ({ ...item, value: item.value === "GERAK" ? 1 : 0 }))}>
									<defs>
										<linearGradient
											id="fillDesktop"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="5%"
												stopColor="var(--primary)"
												stopOpacity={1.0}
											/>
											<stop
												offset="95%"
												stopColor="var(--primary)"
												stopOpacity={0.1}
											/>
										</linearGradient>
										<linearGradient
											id="fillMobile"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop
												offset="5%"
												stopColor="var(--primary)"
												stopOpacity={0.8}
											/>
											<stop
												offset="95%"
												stopColor="var(--primary)"
												stopOpacity={0.1}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid vertical={false} />
									<XAxis
										dataKey="createdAt"
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										minTickGap={50}
										tickFormatter={(value) => {
											const date = new Date(value);
											return date.toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											});
										}}
									/>
									<ChartTooltip
										cursor={false}
										content={
											<ChartTooltipContent
												className="w-52"
												indicator="dot"
												labelFormatter={(value) => {
													return new Date(value).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
													});
												}}
											/>
										}
									/>
									<Area
										dataKey="value"
										type="linear"
										fill="#fff"
										stroke="#fff"
										stackId="a"
									/>
								</AreaChart>
							</ChartContainer>
						</CardContent>
					</Card>
				</div>

				{/* <div className="px-4">
					<Card className="bg-slate-700 border-slate-700">
						<CardHeader className="relative">
							<CardTitle className="text-slate-50">Tabel Data Sensor</CardTitle>
							<CardDescription className="text-slate-50">
								<span className="@[540px]/card:block">Total 50 orang terakhir ke kamar mandi</span>
							</CardDescription>
						</CardHeader>
						<CardContent className="px-2 pt-4">
							<div className="grid overflow-auto ">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead className="w-[300px] text-slate-50">Waktu Pintu Tertutup</TableHead>
											<TableHead className="w-[500px] text-slate-50">Lama didalam kamar mandi</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										<TableRow>
											<TableCell className="font-medium">Kelembapan Tanah</TableCell>
											<TableCell className="text-wrap">Kelembapan Tanah</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</div> */}
			</div>
		</div>
	);
}
