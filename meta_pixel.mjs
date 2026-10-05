// Add the Meta Pixel once to every generated HTML page.
export function addMetaPixel(html) {
  if (html.includes("1040260527597629")) return html;
  return html.replace(/<\/head>/i, `${META_PIXEL}\n</head>`)
    .replace(/(<body\b[^>]*>)/i, `$1\n${META_PIXEL_FALLBACK}`);
}
const META_PIXEL = "<!-- Meta Pixel Code -->\n<script>\n!function(f,b,e,v,n,t,s)\n{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};\nif(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\nn.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];\ns.parentNode.insertBefore(t,s)}(window, document,'script',\n'https://connect.facebook.net/en_US/fbevents.js');\nfbq('init', '1040260527597629');\nfbq('track', 'PageView');\n</script>";
const META_PIXEL_FALLBACK = "<noscript><img height=\"1\" width=\"1\" style=\"display:none\" src=\"https://www.facebook.com/tr?id=1040260527597629&ev=PageView&noscript=1\" /></noscript>\n<!-- End Meta Pixel Code -->";
