async function loadData(sheetUrl) {
	const resp = await fetch(sheetUrl);
	if (!resp.ok) throw new Error(`Failed to fetch sheet: ${resp.status}`);

	const text = await resp.text();
	const rows = text.trim().split("\n").map(r => r.split(","));
	const headers = rows[0].map(h => h.trim());

	return rows.slice(1).reduce((acc, row) => {
		const entry = Object.fromEntries(headers.map((h, i) => [h, (row[i] ?? "").trim()]));
		const name = entry.Name;
		const type = entry.Type;
		const rawDate = entry.Date;

		if (!name || !rawDate || !type) {
			console.warn(`Skipping invalid row: ${JSON.stringify(entry)}`);
			return acc;
		}

		const normalized = type.trim().toLowerCase();
		const typeMap = { birthday: "Birthday", anniversary: "Anniversary" };
		if (!typeMap[normalized]) {
			console.warn(`Unknown type "${type}" for ${name}, skipping`);
			return acc;
		}

		const date = new Date(rawDate);
		if (isNaN(date)) {
			console.warn(`Invalid date "${rawDate}" for ${name}, skipping`);
			return acc;
		}

		acc.push({ name: name.trim(), date, type: typeMap[normalized] });
		return acc;
	}, []);
}

function getTodayIST() {
	const now = new Date();
	const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
	return { day: ist.getUTCDate(), month: ist.getUTCMonth() + 1, year: ist.getUTCFullYear() };
}

function filterTodayEvents(data) {
	const { day, month, year } = getTodayIST();
	const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

	return data.filter(({ date }) => {
		const d = date.getUTCDate();
		const m = date.getUTCMonth() + 1;

		// Feb 29 in non-leap year — fire on Feb 28
		if (d === 29 && m === 2 && !isLeapYear(year)) {
			return day === 28 && month === 2;
		}

		return d === day && m === month;
	});
}

function formatMessage(events) {
	const { year } = getTodayIST();
	const lines = events.map(({ name, date, type }) => {
		const eventYear = date.getUTCFullYear();
		const years = year - eventYear;
		if (type === "Birthday") {
			return `🎈 ${name}'s Birthday — Turning ${years}!`;
		} else {
			return `💍 ${name}'s Anniversary — ${years} years!`;
		}
	});
	return `🎂 Today's Reminders\n\n${lines.join("\n")}`;
}

async function sendTelegram(token, chatId, message, retries = 3) {
	const url = `https://api.telegram.org/bot${token}/sendMessage`;
	for (let i = 1; i <= retries; i++) {
		const resp = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ chat_id: chatId, text: message }),
		});
		if (resp.ok) {
			console.log("Telegram message sent successfully.");
			return;
		}
		const err = await resp.text();
		console.error(`Telegram send attempt ${i} failed: ${err}`);
	}
	throw new Error(`Telegram send failed after ${retries} attempts`);
}

export default {
	async fetch(req) {
		return new Response("Reminder bot is running. Triggered via cron.");
	},

	async scheduled(event, env, ctx) {
		console.log(`Cron triggered at ${event.cron}`);
		try {
			const data = await loadData(env.SHEET_URL);
			console.log(`Loaded ${data.length} records from sheet`);
			const events = filterTodayEvents(data);
			if (events.length === 0) {
				console.log("No events today.");
				return;
			}
			console.log(`${events.length} event(s) found for today.`);
			const message = formatMessage(events);
			console.log(`Message to send:\n${message}`);
			await sendTelegram(env.BOT_TOKEN, env.CHAT_ID, message);
		} catch (err) {
			console.error(`Script failed: ${err.message}`);
		}
		console.log("Cron execution complete.");
	},
};
