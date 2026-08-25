"use client";

import { useEffect } from "react";

const softwareRendererNames = ["swiftshader", "llvmpipe", "software rasterizer"];

const isSoftwareRendering = () => {
	try {
		const canvas = document.createElement("canvas");
		const contextOptions: WebGLContextAttributes = {
			failIfMajorPerformanceCaveat: true,
		};
		const context =
			canvas.getContext("webgl2", contextOptions) ??
			canvas.getContext("webgl", contextOptions);
		if (!context) return true;
		
		const rendererInfo = context.getExtension("WEBGL_debug_renderer_info");
		if (!rendererInfo) return false;
		const renderer = String(
			context.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL),
		).toLowerCase();
		return softwareRendererNames.some((name) => renderer.includes(name));
	} catch {
		return true;
	}
};

export default function RenderingPerformanceMode() {
	useEffect(() => {
		if (!isSoftwareRendering()) return;
		
		document.documentElement.dataset.renderingMode = "software";
		return () => {
			delete document.documentElement.dataset.renderingMode;
		};
	}, []);
	
	return null;
}
