const OUTPUT_FILE = "out"
const MANIFEST = `${OUTPUT_FILE}/manifest.json`

const get_file = src => new Promise((resolve, reject) => {
	const xhr = new XMLHttpRequest()
	xhr.open('GET', src)
	xhr.onload = e => resolve(e)
	xhr.send()
})

const links = document.querySelector('.js-links')
const contentDom = document.querySelector('.js-content')

const sidebar = document.querySelector('.js-sidebar')
get_file(`meta.json`).then(content => {
	const data = JSON.parse(content.target.response)
	data.links.forEach(link => {
		sidebar.innerHTML += `<li>
			<a href="${link.url}">
				${link.name}
			</a>
		</li>`
	})
})

contentDom.addEventListener('click', e => {
	if (e.target.matches('a')) {
		e.preventDefault();
		window.open(e.target.getAttribute('href'))
		return;
	}
})

window.onhashchange = e => {
	href = location.hash.slice(1)
	get_file(`${href}.ipynb`)
		.then(content => {

			const data = JSON.parse(content.target.response)
			console.log(data)
			var notebook = nb.parse(data);
			var rendered = notebook.render();
			console.log(rendered)
			while (contentDom.hasChildNodes()) {
				contentDom.removeChild(contentDom.lastChild);
			}
			contentDom.appendChild(rendered);
			document.querySelectorAll('pre code').forEach((block) => {
				block.className = ""
				block.removeAttribute('data-language')
				block.classList.add('python')

			    hljs.highlightBlock(block);
			    hljs.lineNumbersBlock(block);
			  });
		})
}
links.addEventListener('click', e => {
	e.preventDefault();
	if (!e.target.matches('.js-link')) {
		return
	}

	const href = e.target.getAttribute('href')
	window.location.hash = href

	const active = document.querySelector('.active');
	console.log(active)
	if (active) active.classList.remove('active')
	e.target.classList.add('active')

	
})

get_file(MANIFEST)
	.then(e => {
		const {files} = JSON.parse(e.target.response)
		let i = 0
		files.forEach(file => {
			console.log(file)
			const keys = Object.keys(file)
			const title = keys[0]
			console.log(title, file[title])
			const links_txt = file[title].map(link => {
                const key = Object.keys(link)
                const val = link[key]
                let isactive = ''
                if (i == 0) {
                	++i
                	window.location.hash = ""
                	window.location.hash = `${OUTPUT_FILE}${key}`
                	isactive = ' active'
                }
				return `<li><a class="link js-link ${isactive}" href="${OUTPUT_FILE}${key}"">${val}</a></li>`
			})
			links.innerHTML += `<li class="book-section-flat">
				<a>${title.toUpperCase()}</a>
				<ul>
					<li>
						<ul>
							${links_txt.join('\n')}
						</ul>
					</li>
				</ul>
			</li>`
			// links.innerHTML += `<a>${title.toUpperCase()}</a><ul>${links_txt.join('\n')}</ul>`
		})
		
	})