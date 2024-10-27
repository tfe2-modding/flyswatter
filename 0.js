// mod class initializer
// made by DT
function InitializeMod(mod) {
	const inst = new mod()
	const proto = mod.prototype
	if (proto.update) {
		ModTools.onCityUpdate(proto.update.bind(inst))
	}
	if (proto.modsLoaded) {
		ModTools.onModsLoaded(proto.modsLoaded.bind(inst))
	}
	if (proto.cityCreate) {
		ModTools.onCityCreate(proto.cityCreate.bind(inst))
	}
	if (proto.loadStart) {
		ModTools.onLoadStart(proto.loadStart.bind(inst))
	}
	if (proto.load && !proto.save || !proto.load && proto.save) {
		throw new Error("Mod class must contain both a save and load function if adding custom save data")
	}
	if (proto.load && proto.save) {
		ModTools.addSaveData(mod.name, proto.save.bind(inst), proto.load.bind(inst), proto.version)
	}
	if (proto.earlyLoad && !proto.earlySave || !proto.earlyLoad && proto.earlySave) {
		throw new Error("Mod class must contain both a earlySave and earlyLoad function if adding custom early save data")
	}
	if (proto.earlyLoad && proto.earlySave) {
		ModTools.addSaveDataEarly(mod.name, proto.earlySave.bind(inst), proto.earlyLoad.bind(inst), proto.version)
	}
	
}
window.FlySwatter = class {
	static city
	#game
	constructor() {
		this.debuggers = []

		// modify perf
	
		Perf.FONT_FAMILY = "ms gothic"
	
		Perf.FPS_TXT_CLR = "white"
		Perf.MS_TXT_CLR = "white"
		Perf.MEM_TXT_CLR = "white"
		Perf.MEM_TXT_CLR = "white"
		
		Perf.FPS_BG_CLR = "#0000007f"
		Perf.MS_BG_CLR = "#0000007f"
		Perf.MEM_BG_CLR = "#0000007f"
		Perf.INFO_BG_CLR = "#0000007f"

		// create a perf
	
		let perf = new Perf("TL")
		perf.fps.style.textAlign = "left"
		perf.ms.style.textAlign = "left"
		perf.memory.style.textAlign = "left"
		perf.fps.style.width = "fit-content"
		perf.ms.style.width = "fit-content"
		perf.memory.style.width = "fit-content"
		perf.fps.style.pointerEvents = "none"
		perf.ms.style.pointerEvents = "none"
		perf.memory.style.pointerEvents = "none"
		perf.fps.style.fontSize = "12px"
		perf.ms.style.fontSize = "12px"
		perf.memory.style.fontSize = "12px"
		perf.fps.style.fontWeight = "normal"
		perf.ms.style.fontWeight = "normal"
		perf.memory.style.fontWeight = "normal"
		perf.fps.style.top = "16px"
		perf.ms.style.top = "32px"
		perf.memory.style.top = "48px"

		this.perf = perf
		this.extraPerf = []
		this.showPerf = false

		const top = this.createPerfStat("Right-Click to open menu")
		top.style.top = "0px"

		this.createPerfStat("ModTools.version: "+ModTools.version.toFixed(2))
		if (Liquid) this.createPerfStat("Liquid.version: "+Liquid.version.toFixed(2))
		this.achievementsStatus = this.createPerfStat()
		this.timeSinceStart = this.createPerfStat()
		this.globalGameSet = this.createPerfStat("Global Game: false")

		this.perfDisplay(this.showPerf)

		this.makeMenu()

		document.addEventListener("contextmenu", (m) => {
			this.mx = m.x
			this.my = m.y
			this.menu.popup(m.x, m.y)
		})
	
		document.addEventListener("keydown", (e) => {
			if (e.key.toLowerCase() == "i" && e.ctrlKey) {
				this.showPerf = !this.showPerf
				this.perfDisplay(this.showPerf)
			}
			if (e.key == "f12" && e.ctrlKey) {
				this.setGlobalGame()
			}
		})
		console.info("Do FlySwatter.globalGame() to access the 'game' variable in the console.")

		FlySwatter.globalGame = this.setGlobalGame.bind(this)
		FlySwatter.registerDebugger = this.registerDebugger.bind(this)
	}
	registerDebugger(name, func) {
		this.debuggers.push({
			name: name,
			func: func,
		})
		this.makeMenu()
	}
	makeMenu() {
		let menu = [
			{
				label: "Show Debug Info",
				key: "i",
				modifiers: "ctrl",
				click: () => {
					this.showPerf = !this.showPerf
					this.perfDisplay(this.showPerf)
				}
			},
			{
				label: "Quick Reload",
				key: "F5",
				modifiers: "ctrl",
				click: () => {
					chrome.runtime.reload()
				}
			},
		]
		if (this.debuggers.length > 0) {
			menu.push({
				label: "Debuggers",
				submenu: this.debuggers.map((e,i)=>({
					label: e.name,
					click: () => {
						this.openDebugger(e.func, i, e.name, this.mx, this.my)
					}
				}))
			})
		}
		menu.push(
			{
				label: "Cheats",
				click: () => {
					this.openDebugger(this.cheatsDebugger, -1, "Cheats", this.mx, this.my)
				}
			},
			{
				label: "Dev Tools",
				key: "F12",
				modifiers: "ctrl",
				click: () => {
					this.setGlobalGame()
					nw.Window.get().showDevTools()
				}
			},
		)
		this.menu = this.createMenu(menu)
	}
	update(city) {
		this.achievementsStatus.innerText = "Achievements: "+common_Achievements.achievementsAreEnabled
		this.timeSinceStart.innerText = "Time: "+city.simulation.time.timeSinceStart.toFixed(4)
	}
	cityCreate(city) {
		FlySwatter.city = city
	}
	modsLoaded(game) {
		this.#game = game
		if (this.shouldSetGlobalGame) this.setGlobalGame()
	}
	setGlobalGame() {
		if (!this.#game) {
			this.shouldSetGlobalGame = true
		} else if (!window.game) {
			window.game = this.#game
			console.info("FLY SWATTER:\nGlobal 'game' variable set for easy debugging.\nTHIS IS NOT ACCESSIBLE WITHOUT THIS DEBUG CONSOLE, DO NOT RELY ON THIS WHEN DEVELOPING YOUR MOD.")
			this.globalGameSet.innerText = "Global Game: true"
		}
		return ""
	}
	perfDisplay(d) {
		if (d == false) d = "none"
		if (d == true) d = "block"
		this.perf.fps.style.display = d
		this.perf.ms.style.display = d
		this.perf.memory.style.display = d
		for (let i = 1; i < this.extraPerf.length; i++) {
			this.extraPerf[i].style.display = d
		}
	}
	openDebugger(func, id, title, x=40, y=40) {
		if (document.getElementById('debugger_'+id)) {
			return
		}
		const iframe = document.createElement("iframe")
		iframe.src = "data:text/html,"+encodeURIComponent(`<!DOCTYPE html>
<html>
	<head>
		<title>Cheats</title>
		<style>
			:root {
				/* color-scheme: dark; */
				font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
				user-select: none;
				font-size: 12px;
			}
			@media (prefers-color-scheme: dark) {
				:root {
					color-scheme: dark;
				}
			}
			input {
				border: none;
				border-bottom: 1px solid #7f7f7f;
				outline: none;
				padding: 3px 6px;
				border-radius: 5px;
				background: #7f7f7f3f;
			}
			input:focus-visible {
				outline: 1px solid currentColor;
				outline-offset: 1px;
			}
			button {
				border: 1px solid #7f7f7f;
				outline: none;
				padding: 3px 6px;
				border-radius: 5px;
				background: #7f7f7f3f;
			}
			button:hover:not(:active) {
				background: #7f7f7f7f;
			}
			button:focus-visible {
				outline: 1px solid currentColor;
				outline-offset: 1px;
			}
			body {
				margin: 15px 20px;
			}
		</style>
	</head>
	<body>
		<script src="cheats.js"></script>
	</body>
</html>`)
		iframe.style.border = "none"
		iframe.style.marginBottom = "-4px"
		iframe.width = 640
		iframe.height = 480
		let win = document.createElement("div")
		iframe.onload = function() {
			func(iframe.contentDocument)
			iframe.contentDocument.addEventListener("mousedown", function() {
				;[...document.getElementsByClassName("debugger_window")].forEach(e=>e.style.zIndex = "999")
				win.style.zIndex = "1000"
			})
			iframe.contentDocument.addEventListener("contextmenu", function(e) {
				e.preventDefault()
			})
		}
		;[...document.getElementsByClassName("debugger_window")].forEach(e=>e.style.zIndex = "999")
		win.style.zIndex = "1000"
		win.id = 'debugger_'+id
		win.className = "debugger_window"
		win.style.position = "fixed"
		win.style.left = x+"px"
		win.style.top = y+"px"
		win.style.border = "1px solid #7f7f7f"
	
		// create titlebar
		let titlebar = document.createElement("div")
		titlebar.appendChild(document.createElement("span")).innerText = title
		let close = titlebar.appendChild(document.createElement("a"))
		close.href = "#"
		close.innerText = "(Close)"
		close.onclick = function() {
			win.remove()
		}
		close.style.color = "#ff7777"
		titlebar.style.padding = "7px"
		titlebar.style.fontFamily = "system-ui"
		titlebar.style.fontSize = "12px"
		titlebar.style.background = "#222222"
		titlebar.style.display = "flex"
		titlebar.style.justifyContent = "space-between"
	
		// hide on double click
		titlebar.addEventListener('dblclick', ()=>{
			win.remove()
		})
	
		// make titlebar draggable
		titlebar.onmousedown = e => this.tbdrag(e, win, iframe)
		titlebar.style.cursor = "move"
	
		win.appendChild(titlebar)
	
		// window content
		win.appendChild(iframe)
		document.body.appendChild(win)
	}
	tbdrag(e, win, iframe) {
		let x = e.clientX - win.offsetLeft
		let y = e.clientY - win.offsetTop
		iframe.style.pointerEvents = "none"
		;[...document.getElementsByClassName("debugger_window")].forEach(e=>e.style.zIndex = "999")
		win.style.zIndex = "1000"
		document.onmousemove = function(e) {
			win.style.left = Math.max(0, e.clientX - x) + "px"
			win.style.top = Math.max(0, e.clientY - y) + "px"
		}
		document.onmouseup = function() {
			document.onmousemove = null
			document.onmouseup = null
			iframe.style.pointerEvents = "all"
		}
	}
	createMenu(arr, ret=new nw.Menu()) {
		for (let i = 0; i < arr.length; i++) {
			const item = arr[i]
			if (Array.isArray(item.submenu)) {
				item.submenu = this.createMenu(item.submenu)
			}
			ret.append(new nw.MenuItem(item))
		}
		return ret
	}
	createPerfStat(val, id=null) {
		let info = this.perf._createDiv(id, (this.perf._memCheck ? 48 : 32) + 16 * this.extraPerf.length)
		info.style.backgroundColor = Perf.INFO_BG_CLR
		info.style.color = "white"
		info.style.zIndex = "998"
		info.style.textAlign = "left"
		info.style.width = "fit-content"
		info.style.pointerEvents = "none"
		info.style.fontSize = "12px"
		info.style.fontWeight = "normal"
		info.innerHTML = val
		this.extraPerf.push(info)
		return info
	}
	cheatsDebugger(document) {
		function text(label) {
			document.body.appendChild(document.createElement("p")).innerHTML = label
		}
	
		function checkbox(label, onChange, checked) {
			const p = document.createElement("label")
			p.innerText = label+" "
			const cb = document.createElement("input")
			cb.type = "checkbox"
			cb.onchange = onChange
			cb.checked = checked
			p.appendChild(cb)
			document.body.appendChild(document.createElement("p")).appendChild(p).style.marginLeft = "50px"
			return p
		}
	
		function number(label, onChange, checked) {
			const p = document.createElement("label")
			p.innerText = label+" "
			const cb = document.createElement("input")
			cb.type = "number"
			cb.oninput = onChange
			cb.value = checked
			p.appendChild(cb)
			document.body.appendChild(document.createElement("p")).appendChild(p).style.marginLeft = "50px"
			return p
		}
	
		function button(label, onChange) {
			const p = document.createElement("p")
			p.appendChild(makeButton(label, onChange))
			document.body.appendChild(p).style.marginLeft = "50px"
			return p
		}
	
		function makeButton(label, onChange) {
			const cb = document.createElement("button")
			cb.innerText = label
			cb.onclick = onChange
			return cb
		}
	
		function getCity() {
			return FlySwatter.city
		}
	
		function disableAchievements() {
			getCity().progress.sandbox.everPlayedWithUnlimitedResources = true
			common_Achievements.achievementsAreEnabled = false
		}
	
		const city = getCity()
		text("<strong>WARNING! Using any of these settings will permanently disable achievements on your current save.</strong>")
		text("General Cheats")
		number("Simulation Speed", function() {
			getCity().simulationSpeed = parseFloat(this.value)
			disableAchievements()
		}, city.simulationSpeed)
		number("Time", function() {
			getCity().simulation.time.timeSinceStart = parseFloat(this.value)
			disableAchievements()
		}, city.simulation.time.timeSinceStart)
		button("Unlock everything", function() {
			const city = getCity()
			for (const [k, v] of Object.entries(city.progress.unlocks.unlockState.h)) {
				if ($hxClasses[k] && $hxClasses[k].__name__) {
					city.progress.unlocks.unlock($hxClasses[k])
					city.progress.unlocks.fullyUnlock($hxClasses[k])
				} else {
					city.progress.unlocks.unlock({
						__name__: k
					})
					city.progress.unlocks.fullyUnlock({
						__name__: k
					})
				}
			}
			disableAchievements()
		})
		checkbox("Unlimited Resources", function() {
			disableAchievements()
			const sandbox = getCity().progress.sandbox
			if (this.checked) {
				sandbox.enableUnlimitedResources()
			} else {
				sandbox.disableUnlimitedResources()
			}
		}, city.progress.sandbox.unlimitedResources)
		let happiness
		number("Happiness", function() {
			happiness = parseFloat(this.value)
		}, city.simulation.happiness.happiness)
		button("Set Happiness", function() {
			getCity().simulation.happiness.set_happiness(happiness)
			disableAchievements()
		})
		button("Lock Happiness", function() {
			// this is scuffed as hell but theres no other clean way to do it sooooo
			getCity().simulation.happiness.update = ()=>{}
			disableAchievements()
		})
		button("Unlock Happiness", function() {
			const city = getCity()
			city.simulation.happiness.update = city.simulation.happiness.__proto__.update
			disableAchievements()
		})
		text("Citizen Spawner:")
		let citizenSpawner = {
			time: 0,
			type: "SpawnCitizensFlyingSaucer",
			amount: 10,
			ageRangeMin: 18,
			ageRangeMax: 22,
			world: 0
		}
		number("Amount of citizens", function() {
			citizenSpawner.amount = parseInt(this.value)
		}, citizenSpawner.amount)
		number("Minimum age", function() {
			citizenSpawner.ageRangeMin = parseFloat(this.value)
		}, citizenSpawner.ageRangeMin)
		number("Maximum age", function() {
			citizenSpawner.ageRangeMax = parseFloat(this.value)
		}, citizenSpawner.ageRangeMax)
		button("Spawn Citizen Spaceship", function() {
			const city = getCity()
			city.simulation.citizenSpawners.push(new simulation_SpawnFlyingSaucer(city.simulation, city.farForegroundStage, city.worlds[citizenSpawner.world], Object.assign({}, citizenSpawner)))
			disableAchievements()
		})
		text("Resources:")
		button("Reset all to 0", function() {
			const city = getCity()
			MaterialsHelper.materialNames.forEach(e=>city.materials[e]=0)
			disableAchievements()
		})
		if (true) {
			let v = 0
			let p = number("All resources", function() {
				v = this.value
			}, v)
			p.appendChild(makeButton("Add", function() {
				const city = getCity()
				MaterialsHelper.materialNames.forEach(e=>city.materials[e]+=v)
				disableAchievements()
			}))
			p.appendChild(makeButton("Set", function() {
				const city = getCity()
				MaterialsHelper.materialNames.forEach(e=>city.materials[e]=v)
				disableAchievements()
			}))
		}
		const details = document.createElement("details")
		details.innerHTML = `<summary>Set Individual Resources</summary>`
		details.style.marginLeft = "50px"
		MaterialsHelper.materialNames.forEach(e=>{
			let v = 0
			let p = number(e, function() {
				v = this.value
			}, v)
			p.style.display = "block"
			p.appendChild(makeButton("Add", function() {
				getCity().materials[e] += parseInt(v)
				disableAchievements()
			}))
			p.appendChild(makeButton("Set", function() {
				getCity().materials[e] = parseInt(v)
				disableAchievements()
			}))
			details.append(p)
		})
		document.body.append(details)
	}
}
InitializeMod(FlySwatter)