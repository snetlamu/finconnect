import './App.css'
import * as React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from './components/mode-toggle'
import { Button } from './components/ui/button'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Drawer, DrawerTrigger, DrawerContent, DrawerClose, DrawerHeader, DrawerFooter, DrawerDescription, DrawerTitle } from './components/ui/drawer'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import TradingViewWidget from './components/TradingViewWidget'

declare global {
  interface Element {
    innerText: string
  }
}

type Gainer = {
  symbol: string;
  name: string;
  price: string;
  change: string;
  percent: string;
  volume: string;
}

const stockData = [
  { symbol: "CSCO", value: 225489, fill: "var(--chart-1)" },
  { symbol: "GOOGL", value: 136016, fill: "var(--chart-2)" },
  { symbol: "AMZN", value: 166766, fill: "var(--chart-3)" },
  { symbol: "MSFT", value: 241699, fill: "var(--chart-4)" },
  { symbol: "TSLA", value: 159335, fill: "var(--chart-5)" },
]

const chartConfig = {
  CSCO: {
    label: "Cisco",
    color: "hsl(var(--chart-1))",
  },
  GOOGL: {
    label: "Google",
    color: "hsl(var(--chart-2))",
  },
  AMZN: {
    label: "Amazon",
    color: "hsl(var(--chart-3))",
  },
  MSFT: {
    label: "Microsoft",
    color: "hsl(var(--chart-4))",
  },
  TSLA: {
    label: "Tesla",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

const areaChartData = [
  { year: "2020", CSCO: 45152, GOOGL: 21450, AMZN: 31717, MSFT: 27797, TSLA: 28547 },
  { year: "2021", CSCO: 92168, GOOGL: 74118, AMZN: 55158, MSFT: 63543, TSLA: 35893 },
  { year: "2022", CSCO: 103897, GOOGL: 90289, AMZN: 78751, MSFT: 81930, TSLA: 81744 },
  { year: "2023", CSCO: 171160, GOOGL: 99871, AMZN: 154522, MSFT: 158087, TSLA: 70389 },
  { year: "2024", CSCO: 246560, GOOGL: 167832, AMZN: 165760, MSFT: 132214, TSLA: 159290 },
  { year: "2025", CSCO: 225489, GOOGL: 136016, AMZN: 166766, MSFT: 241699, TSLA: 159335 },
]

const areaChartConfig = {
  CSCO: { label: "CSCO", color: "hsl(var(--chart-1))" },
  GOOGL: { label: "GOOGL", color: "hsl(var(--chart-2))" },
  AMZN: { label: "AMZN", color: "hsl(var(--chart-3))" },
  MSFT: { label: "MSFT", color: "hsl(var(--chart-4))" },
  TSLA: { label: "TSLA", color: "hsl(var(--chart-5))" },
} satisfies ChartConfig

function App() {
  const [gainers, setGainers] = useState<Gainer[]>([]);
  const [loading, setLoading] = useState(true);
  const chartId = "pie-stocks"
  const [activeSymbol, setActiveSymbol] = React.useState(stockData[0].symbol)
  const activeIndex = React.useMemo(
    () => stockData.findIndex((item) => item.symbol === activeSymbol),
    [activeSymbol]
  )
  const symbols = React.useMemo(() => stockData.map((item) => item.symbol), [])

  const [news] = useState<any[]>([
    {
      "title": "Binance and HashKey CEOs on the future of crypto, regulation and adoption",
      "description": "",
      "url": "https://www.cnbc.com/video/2025/03/28/binance-and-hashkey-ceos-on-cryptos-future-adoption-and-regulation.html",
      "image": "https://image.cnbcfm.com/api/v1/image/108122564-THUMB_CONVERGE_LIVE_CLEAN_Crypto_Boost_.jpg?v=1743127252&w=412&h=206&vtcrop=y",
      "source": "CNBC"
    },
    {
      "title": "This restaurant software stock gets a double upgrade from Wells Fargo",
      "description": "",
      "url": "https://www.cnbc.com/2025/04/10/this-restaurant-software-stock-gets-a-double-upgrade-from-wells-fargo.html",
      "image": "https://image.cnbcfm.com/api/v1/image/107374522-17080353122021-09-22t171605z_325597920_rc24vp9fymsa_rtrmadp_0_toast-ipo.jpeg?v=1716572000&w=884&h=442&vtcrop=y",
      "source": "CNBC"
    },
    {
      "title": "Tesla gets price target cut from three Wall Street shops",
      "description": "",
      "url": "https://www.cnbc.com/2025/04/10/tesla-gets-price-target-cut-from-three-wall-street-shops.html",
      "image": "https://image.cnbcfm.com/api/v1/image/108114357-1741726192053-gettyimages-2203994496-AFP_36ZL6CB.jpeg?v=1744281691&w=412&h=442&vtcrop=y",
      "source": "CNBC"
    },
    {
      "title": "Buy the dip on 'ad tech's best executor', Morgan Stanley says",
      "description": "",
      "url": "https://www.cnbc.com/2025/04/10/buy-the-dip-on-ad-techs-best-executor-morgan-stanley-says.html",
      "image": "https://image.cnbcfm.com/api/v1/image/108102085-1739456010557-gettyimages-2172784509-logos.jpeg?v=1744279818&w=412&h=206&vtcrop=y",
      "source": "CNBC"
    }
  ]);

  const getPortfolio = () => {
    axios.get('/portfolio')
  }

  const getNews = () => {
    axios.get('/news')
  }

  useEffect(() => {
    const fetchGainers = async () => {
      try {
        // Use public proxy to bypass CORS
        const response = await axios.get<string>(
          'https://api.allorigins.win/raw?url=https://finance.yahoo.com/most-active/?start=0&count=100'
        );

        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data, 'text/html');
        const rows = doc.querySelectorAll('table tbody tr');

        const top: Gainer[] = [];

        rows.forEach((row, index) => {
          if (index >= 100) return; // limit to top 10
          const cols = row.querySelectorAll('td');
          if (cols.length >= 6) {
            top.push({
              symbol: cols[0].innerText.trim(),
              name: cols[1].innerText.trim(),
              price: cols[2].innerText.trim(),
              change: cols[3].innerText.trim(),
              percent: cols[4].innerText.trim(),
              volume: cols[5].innerText.trim(),
            });
          }
        });

        setGainers(top);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching top gainers:', error);
      }
    };

    fetchGainers();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <div className="marquee">
        {
          loading ?
            <Button style={{ margin: "0em", borderRadius: "0em", width: "100vw" }} variant={"secondary"}>
              Loading...
            </Button>
            :
            <div className="track">
              {gainers.map((stock) => (
                <Button
                  style={{ margin: "0em", borderRadius: "0em" }}
                  key={stock.symbol}
                  variant={"secondary"}
                  onClick={() => {
                    window.open(`https://finance.yahoo.com/quote/${stock.symbol}`, '_blank');
                  }}
                >
                  <span style={{ height: "18px", width: "3px", backgroundColor: (stock.change.includes("-")) ? "red" : "green" }}></span><b>{stock.symbol}:</b> <span style={{ color: (stock.change.includes("-")) ? "red" : "green" }}>{stock.change}</span>
                </Button>
              ))
              }
            </div>
        }
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div>
          <h1 className="scroll-m-20 p-4 pb-5 text-4xl font-bold tracking-tight first:mt-0">FinConnect</h1>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: "1em", left: "1em" }}>
        <ModeToggle />
      </div>
      <div className="flex flex-wrap justify-center items-center gap-16">
        <div className="flex-1" style={{ margin: "auto", padding: "0em 5em", width: "30%", minWidth: "500px" }}>
          <Dialog>
            <DialogTrigger style={{ width: "100%" }}>
              <Card style={{ height: "100%" }} onClick={() => { getPortfolio() }} className="flex flex-col hover:bg-secondary/90">
                <CardHeader className="flex-row items-start space-y-0 pb-0">
                  <div className="grid gap-1">
                    <CardTitle>Portfolio</CardTitle>
                    <CardDescription>Your Investments</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <img style={{ marginTop: "-1em" }} width="100px" src={"/icon-portfolio.svg"} />
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent style={{ maxWidth: "80vw", maxHeight: "80%" }}>
              <DialogHeader>
                <DialogTitle>Stacked Graph of your Investments</DialogTitle>
                <ChartContainer config={areaChartConfig} style={{ maxHeight: "75%", marginTop: "1.2em" }}>
                  <AreaChart
                    accessibilityLayer
                    data={areaChartData}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="year"
                      tickLine={true}
                      axisLine={true}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 4)}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <defs>
                      {Object.keys(areaChartConfig).map((key, idx) => (
                        <linearGradient
                          key={key}
                          id={`fill${key}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={`var(--chart-${idx + 1})`}
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor={`var(--chart-${idx + 1})`}
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      ))}
                    </defs>

                    {Object.keys(areaChartConfig).map((stockKey, idx) => (
                      <Area
                        key={stockKey}
                        dataKey={stockKey}
                        type="natural"
                        fill={`url(#fill${stockKey})`}
                        fillOpacity={0.4}
                        stroke={`var(--chart-${idx + 1})`}
                        stackId="a"
                      />
                    ))}
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-1" style={{ margin: "auto", padding: "0em 5em", width: "30%", minWidth: "500px" }}>
          <Dialog>
            <DialogTrigger style={{ width: "100%" }}>
              <Card style={{ height: "100%" }} className="flex flex-col hover:bg-secondary/90">
                <CardHeader className="flex-row items-start space-y-0 pb-0">
                  <div className="grid gap-1">
                    <CardTitle>Screener</CardTitle>
                    <CardDescription>Dive Deeper into your Investments</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <img style={{ marginTop: "-1em" }} width="100px" src={"/icon-scanner.svg"} />
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent style={{ maxWidth: "80vw", height: "80%" }}>
              <DialogHeader>
                <DialogTitle>Stocks Screener</DialogTitle>
                <TradingViewWidget />
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex-1 h-full" style={{ margin: "auto", padding: "0em 5em", width: "30%", minWidth: "500px", height: "auto" }}>
          <Drawer>
            <DrawerTrigger style={{ width: "100%", height: "100%" }}>
              <Card style={{ height: "100%" }} onClick={() => { getNews() }} className="flex flex-col hover:bg-secondary/90">
                <CardHeader className="flex-row items-start space-y-0 pb-0">
                  <div className="grid gap-1">
                    <CardTitle>Business Updates</CardTitle>
                    <CardDescription>Trending Finance News</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <img style={{ marginTop: "-1em" }} width="100px" src={"/icon-news.svg"} />
                </CardContent>
              </Card>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full" style={{ overflow: "scroll" }}>
                <DrawerHeader className="mx-auto max-w-sm text-center">
                  <DrawerTitle>Finance News</DrawerTitle>
                  <DrawerDescription>Check out what's trending...</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 pb-0 w-full">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {
                      (news.map((article, index) => (
                        <Card
                          key={index}
                          style={{ width: "300px", height: "230px" }}
                          className="hover:bg-secondary/90 cursor-pointer"
                          onClick={() => window.open(article.url, "_blank")}
                        >
                          <CardHeader style={{ minHeight: "40px" }}>
                            <CardTitle>{article.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <img
                              src={article.image}
                              alt={article.title}
                              className="object-cover w-full h-full rounded-lg"
                              style={{ objectFit: "cover", maxHeight: "120px" }}
                            />
                          </CardContent>
                        </Card>
                      )))
                    }
                  </div>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        <div className="flex-1" style={{ margin: "auto", padding: "0em 5em", width: "30%", minWidth: "500px" }}>
          <Card data-chart={chartId} className="flex flex-col h-full">
            <ChartStyle id={chartId} config={chartConfig} />
            <CardHeader className="flex-row items-start space-y-0 pb-0" style={{ zIndex: 50 }}>
              <div className="grid gap-1">
                <CardTitle>Stock Holdings</CardTitle>
                <CardDescription>Top 5</CardDescription>
              </div>
              <Select value={activeSymbol} onValueChange={setActiveSymbol}>
                <SelectTrigger
                  className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
                  aria-label="Select a stock"
                >
                  <SelectValue placeholder="Select stock" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-xl">
                  {symbols.map((key, idx) => {
                    const config = chartConfig[key as keyof typeof chartConfig]
                    if (!config) return null

                    return (
                      <SelectItem
                        key={key}
                        value={key}
                        className="rounded-lg [&_span]:flex"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className="flex h-3 w-3 shrink-0 rounded-sm"
                            style={{
                              backgroundColor: `var(--chart-${idx + 1})`,
                            }}
                          />
                          {config.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent style={{ margin: "-1.5em", marginTop: "-3em" }} className="flex flex-1 justify-center">
              <ChartContainer
                id={chartId}
                config={chartConfig}
                className="mx-auto aspect-square w-full max-w-[200px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={stockData}
                    dataKey="value"
                    nameKey="symbol"
                    innerRadius={60}
                    strokeWidth={5}
                    activeIndex={activeIndex}
                    activeShape={({
                      outerRadius = 0,
                      ...props
                    }: PieSectorDataItem) => (
                      <g>
                        <Sector {...props} outerRadius={outerRadius + 6} />
                        <Sector
                          // on click change the active index to index clicked  
                          {...props}
                          outerRadius={outerRadius + 18}
                          innerRadius={outerRadius + 10}
                        />
                      </g>
                    )}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {stockData[activeIndex].value.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                USD
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  )
}

export default App