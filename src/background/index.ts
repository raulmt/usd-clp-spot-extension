// Chrome types extension for Manifest V3
declare namespace chrome {
  export namespace action {
    function setIcon(
      details: chrome.browserAction.TabIconDetails
    ): Promise<void>;
  }
}

const HEIGHT = 128;
const WIDTH = 128;

const canvas = new OffscreenCanvas(WIDTH, HEIGHT);
const canvasCtx = canvas.getContext("2d");

function drawIcon(amount: number) {
  if (!canvasCtx) return;

  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  canvasCtx.fillStyle = "rgb(255, 255, 255)";
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  // Configure text rendering
  canvasCtx.fillStyle = "rgb(255, 0, 0)";
  canvasCtx.font = "bold 80px sans-serif";
  canvasCtx.fillText(amount.toString(), 5, HEIGHT - 32);

  // Convert to ImageData and set as icon
  const imageData = canvasCtx.getImageData(0, 0, WIDTH, HEIGHT);
  chrome.action.setIcon({ imageData });
}

// Initial draw
drawIcon(0);

// Set up periodic data fetching
chrome.alarms.create("query", {
  periodInMinutes: 2,
  delayInMinutes: 0,
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== "query") return;

  try {
    const res = await fetch(
      "https://mercadosenlinea.biceinversiones.cl/www/chart/datachart.html?ID_NOTATION=2&TIME_SPAN=1M&QUALITY=DLY&VOLUME=false",
      {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch data:", res.status, res.statusText);
      return;
    }

    const dataText = await res.text();
    const jsonCompatibleText = dataText
      .replace(/(\w+):/g, '"$1":')
      .replace(
        /new Date\((\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\)/g,
        (match, year, month, day, hours, minutes, seconds) => {
          const date = new Date(
            parseInt(year),
            parseInt(month),
            parseInt(day),
            parseInt(hours),
            parseInt(minutes),
            parseInt(seconds)
          );
          return `"${date.toISOString()}"`;
        }
      );

    const data = JSON.parse(jsonCompatibleText);
    const latestPrice = data[data.length - 1].close;
    drawIcon(Math.round(latestPrice));
  } catch (error) {
    console.error("Error fetching or processing data:", error);
  }
});
