# Version Selector Text Shifting Fix Plan

## Problem Summary
The `v-select` component in `VersionSelector.vue` shifts text to the right when clicked/focused. After 1+ hour of CSS fixes, the issue persists, indicating this is likely a Vuetify internal behavior that CSS alone cannot override.

## Root Cause Analysis

### Likely Causes:
1. **Vuetify Dynamic DOM Manipulation**: Vuetify's `v-select` likely modifies the DOM structure on focus (adds/removes elements, changes classes)
2. **Outline Notch Calculations**: The floating label and outline notch system may be recalculating positions
3. **JavaScript-Driven Layout Changes**: Vuetify's internal JavaScript may be changing padding/margins/positions dynamically
4. **CSS Specificity War**: Our CSS overrides may not be targeting the right elements or may be overridden by Vuetify's inline styles

### What We've Tried:
- ✅ Locking padding/margins with `!important`
- ✅ Setting explicit widths
- ✅ Using flexbox layouts
- ✅ Absolute positioning of selection text
- ✅ Disabling transitions
- ✅ Locking outline notch position
- ✅ Setting fixed widths on wrapper

## Solution Options (Ranked by Preference)

### Option 1: Use Vuetify Theme System ✅ RECOMMENDED
**Approach**: Configure Vuetify's theme system to customize the select component instead of fighting CSS overrides.

**Pros**:
- Works with Vuetify's internal system
- Less brittle than CSS overrides
- Maintainable

**Cons**:
- Requires understanding Vuetify theme API
- May need to adjust other components

**Implementation**:
1. Check `src/main.js` for Vuetify configuration
2. Add custom theme configuration for `v-select`
3. Use Vuetify's CSS variables/system

### Option 2: Switch to Filled Variant
**Approach**: Change from `variant="outlined"` to `variant="filled"` which has a simpler DOM structure.

**Pros**:
- Simpler DOM structure = less layout complexity
- May not have the shifting issue
- Quick to test

**Cons**:
- Changes visual appearance
- May not match design requirements

**Implementation**:
- Change `variant="outlined"` to `variant="filled"` in `VersionSelector.vue`

### Option 3: Use Native HTML Select Styled
**Approach**: Replace `v-select` with a native `<select>` element and style it to match the app.

**Pros**:
- No Vuetify overhead
- Full control over layout
- No DOM manipulation surprises

**Cons**:
- Requires custom styling from scratch
- May lose some Vuetify features (accessibility, etc.)
- More work upfront

**Implementation**:
- Create new component with native `<select>`
- Style with Tailwind/CSS to match current design

### Option 4: Accept Shift and Prevent Visual Impact
**Approach**: If shift is unavoidable, use CSS to mask it (e.g., fade transitions, wider container).

**Pros**:
- Quick fix
- No major refactoring

**Cons**:
- Doesn't solve root problem
- User may still notice

### Option 5: Use Alternative Component
**Approach**: Use `v-autocomplete` or another Vuetify component.

**Pros**:
- Still uses Vuetify ecosystem

**Cons**:
- Different behavior (dropdown vs select)
- May have same issues

## Recommended Action Plan

### Phase 1: Quick Test (5 minutes)
1. Change `variant="outlined"` to `variant="filled"` in `VersionSelector.vue`
2. Test if shift still occurs
3. If fixed → done! Otherwise continue to Phase 2

### Phase 2: Theme System (15 minutes)
1. Check Vuetify configuration in `src/main.js`
2. Research Vuetify 3 theme customization for selects
3. Configure theme to prevent layout shifts
4. Test

### Phase 3: Native Select (30 minutes) - If Phase 2 fails
1. Create `NativeVersionSelector.vue` component
2. Style to match current design
3. Test and compare
4. Replace if successful

## Immediate Next Steps

1. **First**: Test Option 2 (filled variant) - quickest test
2. **If that fails**: Research Vuetify 3 theme system for selects
3. **If that fails**: Build native select component

## Files to Modify

- `src/components/VersionSelector.vue` (primary)
- `src/style.css` (may need cleanup)
- `src/main.js` (if using theme system)

## Success Criteria

- ✅ No text shifting when clicking/focusing dropdown
- ✅ Visual appearance matches design requirements
- ✅ Maintains accessibility features
- ✅ Works in both light and dark modes

