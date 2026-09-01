import Image from "next/image";

type BrandLogoProps = {
	size?: "compact" | "hero";
};

export function BrandLogo({ size = "compact" }: BrandLogoProps) {
	const isHero = size === "hero";

	return (
		<div
			className={
				isHero ? "flex flex-col items-center" : "flex items-center gap-2.5"
			}
		>
			<Image
				src="/brand/nadaena-mark.svg"
				alt=""
				aria-hidden="true"
				width={isHero ? 128 : 58}
				height={isHero ? 80 : 36}
				className={isHero ? "h-20 w-auto" : "h-9 w-auto"}
			/>
			<div className={isHero ? "mt-2 text-center" : "min-w-0"}>
				<div
					className={
						isHero
							? "text-3xl font-bold tracking-tight"
							: "text-[15px] font-bold tracking-tight"
					}
				>
					나 대 나
				</div>
				<div
					className={
						isHero
							? "mt-1 text-xs font-semibold text-content-dim"
							: "text-[10px] font-semibold text-content-dim"
					}
				>
					nadaena
				</div>
			</div>
		</div>
	);
}
