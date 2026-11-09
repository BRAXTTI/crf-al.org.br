import './index.css'
import { mount } from './client'

// React 19 manages head tags itself; remove server tags before mounting the SPA.
document.querySelectorAll('[data-page-metadata]').forEach((element) => element.remove())

void mount(document.getElementById('root')!)
