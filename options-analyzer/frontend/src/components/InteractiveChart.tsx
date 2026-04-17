import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, AreaSeries } from 'lightweight-charts';
import type { ISeriesApi } from 'lightweight-charts';

interface ChartProps {
  data: { time: string; value: number }[];
  color?: string;
  darkMode?: boolean;
}

export const InteractiveChart: React.FC<ChartProps> = ({ data, color = '#00c805', darkMode = false }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const textColor = darkMode ? '#9CA3AF' : '#8A8A8A';
    const gridColor = darkMode ? '#1F2937' : '#f0f0f0';
    const crosshairColor = darkMode ? '#4B5563' : '#e0e0e0';

    // Create the chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: textColor,
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      grid: {
        vertLines: { visible: false },
        horzLines: { color: gridColor, style: 1 },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      crosshair: {
        mode: 1,
        vertLine: { color: crosshairColor, labelBackgroundColor: '#1a1a1a' },
        horzLine: { color: crosshairColor, labelBackgroundColor: '#1a1a1a' },
      },
      handleScroll: {
          mouseWheel: false,
          pressedMouseMove: true,
      },
      handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: false,
          pinch: true,
      }
    });

    // Add Area series for the gradient under the line using v5 API
    const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: color,
        lineWidth: 2,
        topColor: `${color}40`, // 25% opacity
        bottomColor: `${color}00`, // 0% opacity
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: '#ffffff',
        crosshairMarkerBackgroundColor: color,
    });

    areaSeries.setData(data as any);

    chartInstanceRef.current = chart;
    seriesRef.current = areaSeries; 

    // Handle Resize
    const handleResize = () => {
        if (chartContainerRef.current) {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [color]);

  // Update data if it changes
  useEffect(() => {
      if (seriesRef.current && data.length > 0) {
          seriesRef.current.setData(data as any);
      }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};
