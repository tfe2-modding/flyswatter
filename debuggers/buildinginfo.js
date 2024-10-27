FlySwatter.registerDebugger("buildinginfo Editor", function(document) {
	function list() {
		document.body.innerText = ""
		const ul = document.body.appendChild(document.createElement("ul"))
		ul.style.columnCount = 2
		for (const [k, v] of Object.entries(Resources.buildingInfo.h)) {
			const a = ul.appendChild(document.createElement("li")).appendChild(document.createElement("a"))
			a.href = "#"
			a.innerText = v.className
			a.onclick = function() {
				view(k)
			}
		}
	}
	function text(label) {
		let p = document.body.appendChild(document.createElement("p"))
		p.innerHTML = label
		return p
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
	function string(label, onChange, checked) {
		const p = document.createElement("label")
		p.innerText = label+" "
		const cb = document.createElement("input")
		cb.type = "text"
		cb.oninput = onChange
		cb.value = checked || ""
		cb.width = "100%"
		p.appendChild(cb)
		document.body.appendChild(document.createElement("p")).appendChild(p).style.marginLeft = "50px"
		return p
	}
	function multiline(label, onChange, checked) {
		const p = document.createElement("label")
		p.innerText = label+" "
		const cb = document.createElement("textarea")
		cb.oninput = onChange
		cb.value = checked || ""
		cb.style.width = "400px"
		cb.style.height = "60px"
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
	function view(key) {
		document.body.innerText = ""
		text(`<a href="#">Explanation of what each field means</a>`).onclick = function() {
			nw.Shell.openExternal('https://tfe2-modding.github.io/DataFiles/buildinginfo.json.html')
		}
		text("Changes take effect when you reload the city")
		const a = document.body.appendChild(document.createElement("a"))
		a.href = "#"
		a.innerText = "List"
		a.onclick = list
		document.body.appendChild(document.createTextNode(" - "+key))
		if (false) {
			const pre = document.body.appendChild(document.createElement("pre"))
			pre.innerText = JSON.stringify(Resources.buildingInfo.h[key], null, "    ")
		} else {
			const building = Resources.buildingInfo.h[key]
			text("General Information:")
			string("name", function() {
				building.name = this.value
			}, building.name)
			multiline("description", function() {
				if (this.value) building.description = this.value
				else delete building.description
			}, building.description)
			string("category", function() {
				if (this.value) building.category = this.value
				else delete building.category
			}, building.category)
			checkbox("unlockedByDefault", function() {
				building.unlockedByDefault = this.checked
			}, !!building.unlockedByDefault)
			multiline("showUnlockHint", function() {
				if (this.value) building.showUnlockHint = this.value
				else delete building.showUnlockHint
			}, building.showUnlockHint)
			number("residents", function() {
				if (this.value) building.residents = parseFloat(this.value)
				else delete building.residents
			}, building.residents)
			number("jobs", function() {
				if (this.value) building.jobs = parseFloat(this.value)
				else delete building.jobs
			}, building.jobs)
			number("quality", function() {
				if (this.value) building.quality = parseFloat(this.value)
				else delete building.quality
			}, building.quality)
			number("teleporterOperatingCost", function() {
				if (this.value) building.teleporterOperatingCost = parseFloat(this.value)
				else delete building.teleporterOperatingCost
			}, building.teleporterOperatingCost)
			text("Cost:")
			MaterialsHelper.materialNames.forEach(e=>{
				number(e, function() {
					if (this.value) building[e] = parseFloat(this.value)
					else delete building[e]
				}, building[e]).parentElement.style.margin = "5px 0px"
			})
			text("Extra Information:")
			checkbox("notUnlockedWithAll", function() {
				building.notUnlockedWithAll = this.checked
			}, !!building.notUnlockedWithAll)
			string("buttonBack", function() {
				if (this.value) building.buttonBack = this.value
				else delete building.buttonBack
			}, building.buttonBack)
			string("onBuildSprite", function() {
				if (this.value) building.onBuildSprite = this.value
				else delete building.onBuildSprite
			}, building.onBuildSprite)
			multiline("specialInfo", function() {
				const specialInfo = this.value.match(/.+/gm) || []
				building.specialInfo = specialInfo
			}, building.specialInfo.join("\n"))
			if (building.tooltipBottomIconInfo) {
				text("tooltipBottomIconInfo (cannot edit)")
				const p = text(JSON.stringify(building.tooltipBottomIconInfo, null, "    "))
				p.style.fontFamily = "monospace"
				p.style.whiteSpace = "pre-wrap"
			}
		}
	}
	list()
})