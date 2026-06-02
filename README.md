# 📋 Todo App — Prueba Técnica Ionic/Angular

Aplicación de lista de tareas con sistema de categorías, desarrollada con **Ionic 8**, **Angular 20** y **Cordova**.

## 🚀 Características

- ✅ CRUD completo de tareas (agregar, completar, eliminar)
- 🏷️ Sistema de categorías (crear, editar, eliminar, asignar)
- 🔍 Filtrado de tareas por categoría
- 🔥 Firebase Remote Config con feature flag para categorías
- ⚡ Optimización de rendimiento (OnPush, Signals, Lazy Loading)
- 🌙 Soporte para Dark Mode
- 📱 Compilación nativa Android (APK) e iOS (IPA) vía Cordova

## 📂 Estructura del Proyecto

```
src/app/
├── core/
│   ├── models/             # Interfaces: Task, Category
│   └── services/           # TaskService, CategoryService, FeatureFlagService, StorageService
├── features/
│   ├── tasks/              # Página principal + TaskItemComponent
│   └── categories/         # Gestión de categorías
├── app.component.ts        # Componente raíz (standalone)
├── app.config.ts           # Configuración de providers
└── app.routes.ts           # Rutas con lazy loading
```

## 🛠️ Requisitos Previos

- **Node.js** >= 20 LTS
- **npm** >= 10
- **Ionic CLI**: `npm install -g @ionic/cli`
- **Cordova**: `npm install -g cordova`
- **Android Studio** + Android SDK (para APK)
- **Xcode** (para IPA, solo macOS)

## ⚙️ Instalación y Ejecución

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd todo-app

# Instalar dependencias
npm install

# Ejecutar en navegador
ionic serve
```

## 📱 Compilación Android (APK)

```bash
# Agregar plataforma Android (si no existe)
ionic cordova platform add android

# Build de producción
ionic cordova build android --prod --release

# APK generado en:
# platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### Firmar APK

```bash
keytool -genkey -v -keystore todo-app.keystore -alias todo-app -keyalg RSA -keysize 2048 -validity 10000
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore todo-app.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk todo-app
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk todo-app.apk
```

## 🍎 Compilación iOS (IPA)

> ⚠️ Requiere macOS con Xcode

```bash
ionic cordova platform add ios
ionic cordova build ios --prod --release
# Abrir en Xcode: open platforms/ios/*.xcworkspace
```

## 🔥 Firebase Remote Config

### Configuración

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Agregar app web → copiar credenciales en `src/environments/environment.ts`:

```typescript
firebase: {
  apiKey: 'TU_API_KEY',
  authDomain: 'TU_PROJECT.firebaseapp.com',
  projectId: 'TU_PROJECT_ID',
  storageBucket: 'TU_PROJECT.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123',
}
```

3. En Remote Config crear parámetro: `categories_enabled` (Boolean, default: `true`)

### Demo del Feature Flag

| Valor | Comportamiento |
|-------|---------------|
| `true` | Categorías visibles: filtros, botón gestión, asignación |
| `false` | Categorías ocultas: app funciona como simple todo list |

## ⚡ Optimizaciones Aplicadas

| Técnica | Impacto |
|---------|---------|
| Standalone Components | Menor overhead sin NgModules |
| Angular Signals | Reactividad granular sin RxJS |
| OnPush Change Detection | Menos ciclos de detección |
| Lazy Loading + PreloadAllModules | Bundle inicial pequeño, navegación fluida |
| `@for` con `track` | Minimiza DOM mutations |
| Dynamic import Firebase | ~200KB cargados solo si se necesita |
| Event coalescing (Zone.js) | Menos zone ticks |

## 📝 Preguntas Técnicas

### Principales desafíos

1. **Migración standalone**: El starter de Ionic usa NgModules. Reestructuré a standalone components con `provideIonicAngular()`.
2. **Firebase sin @angular/fire**: Usé dynamic imports directos del SDK para menor acoplamiento y bundle.
3. **Cordova + Angular 20**: Asegurar compatibilidad del output en `www/` para el webview de Cordova.

### Técnicas de optimización y por qué

- **Signals** → Estado sincrónico local sin crear subscriptions/unsubscriptions.
- **OnPush** → Listas largas no re-renderizan innecesariamente.
- **Lazy loading** → Time to Interactive más rápido.
- **Dynamic imports** → Firebase solo se carga si hay projectId configurado.

### Calidad y mantenibilidad

- TypeScript strict mode (cero `any`)
- Separación clara de capas (models → services → components)
- Componentes pequeños con responsabilidad única
- Inmutabilidad con `readonly` en interfaces
- Commits atómicos con trunk-based development

## 🌿 Estrategia de Git

Trunk-based development con ramas cortas:

```
main ──────────────────────────────────────────────────
  └── feature/todo-crud ──────────── merge ──┐
  └── feature/categories ─────────── merge ──┤
  └── feature/firebase-remote-config  merge ──┤
  └── feature/performance-and-theme ─ merge ──┤
  └── feature/cordova-build ────────── merge ──┘
```

## 📄 Licencia

MIT
