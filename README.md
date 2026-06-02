# 📋 Todo App — Prueba Técnica Ionic/Angular

Aplicación de lista de tareas con sistema de categorías, desarrollada con **Ionic 8**, **Angular 20** y **Capacitor**.

## 🚀 Características

- ✅ CRUD completo de tareas (agregar, editar, completar, eliminar)
- 🏷️ Sistema de categorías (crear, editar, eliminar, asignar)
- 🔍 Filtrado de tareas por categoría
- 🔥 Firebase Remote Config con feature flag para categorías
- ⚡ Optimización de rendimiento (OnPush, Signals, Lazy Loading)
- 🌙 Soporte para Dark Mode
- 📱 Compilación nativa Android (APK) e iOS (IPA) vía Capacitor

## 📂 Estructura del Proyecto

```
src/app/
├── core/
│   ├── models/             # Interfaces: Task, Category
│   └── services/           # TaskService, CategoryService, FeatureFlagService, StorageService
├── features/
│   ├── tasks/              # Página principal + TaskItemComponent
│   │   └── components/     # Componentes hijos de tasks
│   └── categories/         # Gestión de categorías
├── app.component.ts        # Componente raíz
├── app.config.ts           # Configuración de providers
└── app.routes.ts           # Rutas con lazy loading
```

## 🛠️ Requisitos Previos

- **Node.js** >= 20 LTS
- **npm** >= 10
- **Ionic CLI**: `npm install -g @ionic/cli`
- **Android Studio** + Android SDK (para compilar APK)
- **Xcode** (para compilar IPA, solo macOS)

## ⚙️ Instalación y Ejecución

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd todo-app

# Instalar dependencias
npm install

# Copiar configuración de Firebase
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.prod.ts
# Editar con tus credenciales de Firebase

# Ejecutar en navegador
ionic serve
```

## 📱 Compilación Android (APK)

```bash
# Build web + sync con Capacitor
npm run build:android

# Abrir en Android Studio para compilar APK
npx cap open android

# O compilar desde terminal (requiere JAVA_HOME y ANDROID_HOME configurados)
cd android && ./gradlew assembleDebug
# APK en: android/app/build/outputs/apk/debug/app-debug.apk
```

### Variables de entorno requeridas

```bash
# Windows — agregar a variables de entorno del sistema
JAVA_HOME=<ruta-a-jdk>          # Ej: D:\android studio\jbr
ANDROID_HOME=<ruta-a-sdk>       # Ej: C:\Users\<user>\AppData\Local\Android\Sdk
```

## 🍎 Compilación iOS (IPA)

> ⚠️ Requiere macOS con Xcode

```bash
# Agregar plataforma iOS
npx cap add ios

# Build web + sync
npm run build:ios

# Abrir en Xcode para firma y exportación
npx cap open ios
```

## 🔥 Firebase Remote Config

### Configuración

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Agregar app web → copiar credenciales en `src/environments/environment.ts`
3. En Remote Config crear parámetro: `categories_enabled` (String, default: `true`)
4. Publicar cambios

### Demo del Feature Flag

| Valor | Comportamiento |
|-------|---------------|
| `true` | Categorías visibles: filtros, botón gestión, badges, selector al crear/editar |
| `false` | Categorías ocultas: app funciona como simple todo list |

## ⚡ Optimizaciones Aplicadas

| Técnica | Impacto |
|---------|---------|
| Standalone Components (sin NgModules) | Menor overhead de compilación |
| Angular Signals | Reactividad granular sin RxJS |
| OnPush Change Detection | Menos ciclos de detección |
| Lazy Loading + PreloadAllModules | Bundle inicial pequeño, navegación fluida |
| `@for` con `track` | Minimiza DOM mutations |
| Dynamic import Firebase | ~200KB cargados solo cuando hay projectId |
| Event coalescing (Zone.js) | Menos zone ticks |
| CSS Animations sobre JS Animations | Mejor rendimiento, sin API deprecated |
| inject() sobre constructor DI | Pattern moderno Angular 20 |

## 📝 Preguntas Técnicas

### Principales desafíos

1. **Standalone + Ionic**: El starter de Ionic usa NgModules. Reestructuré completamente a standalone con `provideIonicAngular()`.
2. **Firebase sin @angular/fire**: Usé dynamic imports directos del SDK para menor acoplamiento y bundle size.
3. **Capacitor como runtime nativo**: Elegí Capacitor sobre Cordova por ser el estándar moderno de Ionic, mejor integración con Angular y soporte activo.
4. **ion-alert limitaciones**: No soporta mezclar inputs text+radio. Resolví con flujo de dos pasos (título → categoría).

### Técnicas de optimización y por qué

- **Signals** → Estado sincrónico sin crear subscriptions ni memory leaks.
- **OnPush** → Listas largas no re-renderizan innecesariamente.
- **Lazy loading** → Time to Interactive más rápido.
- **CSS @keyframes** → Angular Animations API está deprecated en v20; CSS es más performante y estándar.
- **Dynamic imports** → Firebase solo se carga si hay projectId configurado.

### Calidad y mantenibilidad

- TypeScript strict mode (cero `any`, cero `console.log`)
- Separación clara: models → services → components
- Signal inputs/outputs (API moderna Angular 20)
- `inject()` sobre constructor injection
- Inmutabilidad con `readonly` en interfaces
- Archivos separados .ts / .html / .scss
- Commits atómicos con trunk-based development

## 🌿 Estrategia de Git

Trunk-based development con feature branches cortas:

```
main ──────────────────────────────────────────────────
  ├── feature/todo-crud
  ├── feature/categories
  ├── feature/firebase-remote-config
  ├── feature/performance-and-theme
  ├── feature/cordova-build
  ├── feature/animations
  ├── feature/android-build
  ├── feature/edit-tasks
  ├── feature/firebase-env-config
  ├── feature/clean-code-optimizations
  └── feature/capacitor-migration
```

## 🔧 Tecnologías

| Herramienta | Versión |
|-------------|---------|
| Ionic | 8.x |
| Angular | 20.x |
| Capacitor | 8.x |
| Firebase | 12.x |
| TypeScript | 5.9 |
| Node.js | 22 LTS |

## 📄 Licencia

MIT
