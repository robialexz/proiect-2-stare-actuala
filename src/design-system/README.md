# Design System

Acest folder conține componente atomice, design tokens, utilitare și documentație pentru sistemul de design modern al aplicației.

## Structură
- `/tokens` — Variabile de design (culori, spațiere, fonturi, umbre, animații)
  - `colors.ts` - Paletă de culori și variabile pentru teme
  - `typography.ts` - Fonturi, dimensiuni și stiluri de text
  - `spacing.ts` - Spațiere, margini, padding și dimensiuni
  - `animations.ts` - Animații, tranziții și timing functions
  - `index.ts` - Export centralizat pentru toate token-urile
- `/components` — Componente atomice și molecule
  - `Button.tsx` - Buton cu variante și animații
  - `Card.tsx` - Card cu header, content și footer
  - `Input.tsx` - Input cu variante și validare
- `/themes` — Fișiere pentru dark mode, light mode și teme custom (în dezvoltare)
- `/utils` — Funcții de utilitate pentru stilizare și accesibilitate (în dezvoltare)

## Tehnologii utilizate
- [Shadcn UI v2](https://ui.shadcn.com/) pentru componente moderne
- [Tailwind CSS](https://tailwindcss.com/) pentru utilitare rapide
- [Framer Motion](https://www.framer.com/motion/) pentru animații

## Cum să utilizezi Design System-ul

### Importarea token-urilor
```tsx
// Importă toate token-urile
import { colors, typography, spacing, animations } from "@/design-system/tokens";

// Sau importă token-uri specifice
import { colors } from "@/design-system/tokens/colors";
import { typography } from "@/design-system/tokens/typography";
```

### Utilizarea componentelor
```tsx
// Importă componente din design system
import { Button } from "@/design-system/components/Button";
import { Card } from "@/design-system/components/Card";
import { Input } from "@/design-system/components/Input";

// Utilizează componentele în aplicație
<Button variant="primary">Click me</Button>

<Card>
  <Card.Header>
    <Card.Title>Titlu card</Card.Title>
    <Card.Description>Descriere card</Card.Description>
  </Card.Header>
  <Card.Content>
    Conținut card
  </Card.Content>
  <Card.Footer>
    <Button>Acțiune</Button>
  </Card.Footer>
</Card>
```

### Utilizarea claselor CSS predefinite
Am adăugat clase CSS utilitare în `index.css` pentru a facilita utilizarea design system-ului:

```tsx
// Utilizarea claselor pentru carduri
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Titlu card</h3>
    <p className="card-description">Descriere card</p>
  </div>
  <div className="card-content">
    Conținut card
  </div>
  <div className="card-footer">
    <button className="btn btn-primary">Acțiune</button>
  </div>
</div>

// Utilizarea claselor pentru butoane
<button className="btn btn-primary">Buton primar</button>
<button className="btn btn-secondary">Buton secundar</button>
<button className="btn btn-outline">Buton outline</button>

// Utilizarea claselor pentru animații
<div className="animate-in fade-in">Animație fade in</div>
<div className="animate-in slide-in-from-top">Animație slide in de sus</div>
```

## Actualizări recente
- Adăugat sistem de culori extins cu paletă completă
- Adăugat sistem de tipografie cu stiluri predefinite
- Adăugat sistem de spațiere și dimensiuni
- Adăugat sistem de animații și tranziții
- Adăugat clase CSS utilitare pentru componente și animații
- Îmbunătățit suportul pentru teme (dark/light)

---

**Acest design system este în continuă dezvoltare și va fi extins cu noi componente și funcționalități.**
