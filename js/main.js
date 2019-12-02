const OUTPUT_FILE = "out"
const MANIFEST = `${OUTPUT_FILE}/manifest.json`

const INPUT_FILE = "in"
const MANIFEST_IN = `${INPUT_FILE}/manifest.json`

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
			<a href="${link.url}" target="_blank">
				${link.name}
			</a>
		</li>`
	})
})

contentDom.addEventListener('click', e => {
	if (e.target.matches('a')) {
        if (e.target.getAttribute('href').indexOf('#') == 0) return;
        if (e.target.getAttribute('href').indexOf('https://colab.research.google.com/github/mottaquikarim/pycontent') !== -1) {
            let href = e.target.getAttribute('href')
            e.target.setAttribute('href', href.replace('mottaquikarim/pycontent', 'mottaquikarim/PYTH122'))
        }
		e.preventDefault();
		window.open(e.target.getAttribute('href'))
		return;
	}
})

window.onhashchange = e => {
	href = location.hash.slice(1)
    let file = null;
    let is_md = false;
    console.log(href)
    if (href.indexOf(`${INPUT_FILE}/`) !== -1) {
        file = get_file(`${href}.md`);
        is_md = true;
    }
    else {
        file = get_file(`${href}.ipynb`)
    }

    file
        .then(content => {
			while (contentDom.hasChildNodes()) {
				contentDom.removeChild(contentDom.lastChild);
			}

            let rendered = null;
            if (is_md) {
                rendered = content.target.response;
                contentDom.innerHTML = marked(rendered);
            }
            else {
                const data = JSON.parse(content.target.response)
                const notebook = nb.parse(data);
                rendered = notebook.render();
			    contentDom.appendChild(rendered);
            }

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

const all_files = Promise.all([get_file(MANIFEST), get_file(MANIFEST_IN)])

all_files
    .then(([manifest, manifest_in]) => {
        const out_content = JSON.parse(manifest.target.response)
        const in_content = JSON.parse(manifest_in.target.response)
        return [out_content, in_content]
    })
    .then(([out_, in_]) => {
		const {files} = out_ ;
		let i = 0
		files.forEach(file => {
			console.log(file)
			const keys = Object.keys(file)
			const title = keys[0]
			console.log(title, file[title])
			const links_txt = file[title].map(link => {
                const key = Object.keys(link)
                const val = link[key]
                let path = `${OUTPUT_FILE}${key}`
                if (in_[key]) {
                    path = `${INPUT_FILE}${key}`
                }
                let isactive = ''
                if (i == 0) {
                	++i
                	window.location.hash = "";
                	window.location.hash = path ;
                	isactive = ' active';
                }
				return `<li><a class="link js-link ${isactive}" href="${path}"">${val}</a></li>`
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
		})
    })

/*
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
*/
