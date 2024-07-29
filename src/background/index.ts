const canvas = document.createElement("canvas");
const canvasCtx = canvas.getContext("2d");
canvasCtx.font = "bold 70px sans-serif";

const HEIGHT = 128;
const WIDTH = 128;

function drawIcon(amount) {
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  canvasCtx.fillStyle = "rgb(255, 255, 255)";
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  canvasCtx.fillStyle = "rgb(255, 0, 0)";
  canvasCtx.fillText(amount, 5, HEIGHT - 32);
  chrome.browserAction.setIcon({
    imageData: canvasCtx.getImageData(0, 0, WIDTH, HEIGHT),
  });
}

drawIcon(100);

chrome.alarms.create("query", {
  periodInMinutes: 2,
  delayInMinutes: 0,
});

chrome.alarms.onAlarm.addListener(async () => {
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
  drawIcon(data[data.length - 1].close);
});
