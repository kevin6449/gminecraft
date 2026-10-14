import { BlockId, CRAFTING_RECIPES, CraftingRecipe, getBlockMaterialLabel, getItemDef, ITEM_REGISTRY } from '../world/BlockRegistry';
import { TextureAtlas } from '../world/TextureAtlas';
import { SoundManager } from '../audio/SoundManager';
import { getItemName, getRecipeDesc, t } from '../i18n/I18nManager';

export interface InventorySlot {
  itemId: BlockId;
  count: number;
}

export class InventoryManager {
  public hotbar: InventorySlot[] = [];
  public bag: InventorySlot[] = [];
  public selectedIndex = 0;
  public isModalOpen = false;
  private activeTab: 'catalog' | 'crafting' | 'bag' = 'catalog';

  private hotbarEl: HTMLElement;
  private selectedLabelEl: HTMLElement;
  private modalEl: HTMLElement;
  private catalogGridEl: HTMLElement;
  private craftingListEl: HTMLElement;
  private bagGridEl: HTMLElement;

  constructor(
    private atlas: TextureAtlas,
    private sound: SoundManager,
    private isCreativeMode: () => boolean,
    private onToast: (msg: string) => void,
    private onHotbarChange?: () => void
  ) {
    this.hotbarEl = document.getElementById('hotbar')!;
    this.selectedLabelEl = document.getElementById('selected-item-label')!;
    this.modalEl = document.getElementById('inventory-modal')!;
    this.catalogGridEl = document.getElementById('catalog-grid')!;
    this.craftingListEl = document.getElementById('crafting-list')!;
    this.bagGridEl = document.getElementById('bag-grid')!;

    this.initDefaultInventory();
    this.bindUIEvents();
    this.renderHotbar();
  }

  public initDefaultInventory(): void {
    this.hotbar = [
      { itemId: BlockId.Grass, count: 64 },
      { itemId: BlockId.Cobblestone, count: 64 },
      { itemId: BlockId.OakPlanks, count: 64 },
      { itemId: BlockId.OakDoor, count: 16 },
      { itemId: BlockId.Glass, count: 64 },
      { itemId: BlockId.Glowstone, count: 64 },
      { itemId: BlockId.TNT, count: 16 },
      { itemId: BlockId.DiamondPickaxe, count: 1 },
      { itemId: BlockId.DiamondSword, count: 1 },
    ];

    this.bag = Array.from({ length: 18 }, () => ({ itemId: BlockId.Air, count: 0 }));
    this.bag[0] = { itemId: BlockId.OakLog, count: 16 };
    this.bag[1] = { itemId: BlockId.Sand, count: 24 };
    this.bag[2] = { itemId: BlockId.Coal, count: 12 };
    this.bag[3] = { itemId: BlockId.IronIngot, count: 8 };
    this.bag[4] = { itemId: BlockId.CookedPork, count: 6 };
    this.bag[5] = { itemId: BlockId.Bookshelf, count: 16 };
    this.bag[6] = { itemId: BlockId.CraftingTable, count: 4 };
    this.bag[7] = { itemId: BlockId.Water, count: 16 };
    this.bag[8] = { itemId: BlockId.Bricks, count: 64 };
  }

  private bindUIEvents(): void {
    const closeBtn = document.getElementById('btn-close-inventory');
    closeBtn?.addEventListener('click', () => this.toggleModal(false));

    const tabBtns = this.modalEl.querySelectorAll<HTMLButtonElement>('.tab-btn');
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab as 'catalog' | 'crafting' | 'bag';
        this.switchTab(tab);
      });
    });

    window.addEventListener('wheel', (e) => {
      if (this.isModalOpen) return;
      if (e.deltaY > 0) {
        this.selectSlot((this.selectedIndex + 1) % 9);
      } else if (e.deltaY < 0) {
        this.selectSlot((this.selectedIndex + 8) % 9);
      }
    });
  }

  public switchTab(tab: 'catalog' | 'crafting' | 'bag'): void {
    this.activeTab = tab;
    const tabBtns = this.modalEl.querySelectorAll<HTMLButtonElement>('.tab-btn');
    tabBtns.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    document.getElementById('tab-catalog')?.classList.toggle('hidden', tab !== 'catalog');
    document.getElementById('tab-crafting')?.classList.toggle('hidden', tab !== 'crafting');
    document.getElementById('tab-bag')?.classList.toggle('hidden', tab !== 'bag');

    this.renderModalContent();
  }

  public toggleModal(forceState?: boolean): void {
    const next = forceState !== undefined ? forceState : !this.isModalOpen;
    this.isModalOpen = next;
    this.modalEl.classList.toggle('hidden', !this.isModalOpen);

    if (this.isModalOpen) {
      document.exitPointerLock?.();
      // 若為生存模式，預設優先打開合成配方分頁；創造模式打開物品庫
      this.switchTab(this.isCreativeMode() ? 'catalog' : 'crafting');
    }
  }

  public selectSlot(index: number): void {
    if (index < 0 || index >= 9) return;
    this.selectedIndex = index;
    this.renderHotbar();
    this.onHotbarChange?.();
  }

  public getSelectedSlot(): InventorySlot {
    return this.hotbar[this.selectedIndex] || { itemId: BlockId.Air, count: 0 };
  }

  public getSelectedItemId(): BlockId {
    const slot = this.getSelectedSlot();
    return slot.count > 0 ? slot.itemId : BlockId.Air;
  }

  public consumeSelected(amount = 1): boolean {
    const slot = this.getSelectedSlot();
    if (slot.itemId === BlockId.Air || slot.count <= 0) return false;
    if (this.isCreativeMode()) return true; // 創造模式無限方塊

    slot.count -= amount;
    if (slot.count <= 0) {
      slot.itemId = BlockId.Air;
      slot.count = 0;
    }
    this.renderHotbar();
    this.onHotbarChange?.();
    return true;
  }

  public addItem(itemId: BlockId, count = 1): boolean {
    if (itemId === BlockId.Air || count <= 0) return false;

    // 1. 先找快捷欄已有相同物品堆疊
    for (const slot of this.hotbar) {
      if (slot.itemId === itemId && slot.count < 99) {
        slot.count += count;
        this.renderHotbar();
        return true;
      }
    }
    // 2. 找背包已有相同物品堆疊
    for (const slot of this.bag) {
      if (slot.itemId === itemId && slot.count < 99) {
        slot.count += count;
        if (this.isModalOpen) this.renderModalContent();
        return true;
      }
    }
    // 3. 找快捷欄空格
    for (const slot of this.hotbar) {
      if (slot.itemId === BlockId.Air || slot.count === 0) {
        slot.itemId = itemId;
        slot.count = count;
        this.renderHotbar();
        this.onHotbarChange?.();
        return true;
      }
    }
    // 4. 找背包空格
    for (const slot of this.bag) {
      if (slot.itemId === BlockId.Air || slot.count === 0) {
        slot.itemId = itemId;
        slot.count = count;
        if (this.isModalOpen) this.renderModalContent();
        return true;
      }
    }
    return false;
  }

  public getItemTotalCount(itemId: BlockId): number {
    let total = 0;
    for (const s of this.hotbar) {
      if (s.itemId === itemId) total += s.count;
    }
    for (const s of this.bag) {
      if (s.itemId === itemId) total += s.count;
    }
    return total;
  }

  public removeItemCount(itemId: BlockId, needed: number): void {
    let rem = needed;
    const allSlots = [...this.hotbar, ...this.bag];
    for (const s of allSlots) {
      if (s.itemId === itemId && s.count > 0) {
        const take = Math.min(s.count, rem);
        s.count -= take;
        rem -= take;
        if (s.count <= 0) {
          s.itemId = BlockId.Air;
          s.count = 0;
        }
        if (rem <= 0) break;
      }
    }
    this.renderHotbar();
  }

  public canCraft(recipe: CraftingRecipe): boolean {
    if (this.isCreativeMode()) return true;
    return recipe.ingredients.every((ing) => this.getItemTotalCount(ing.itemId) >= ing.count);
  }

  public craft(recipe: CraftingRecipe): void {
    if (!this.canCraft(recipe)) {
      this.onToast(t('toastCraftFail'));
      return;
    }
    if (!this.isCreativeMode()) {
      for (const ing of recipe.ingredients) {
        this.removeItemCount(ing.itemId, ing.count);
      }
    }
    this.addItem(recipe.outputId, recipe.outputCount);
    this.sound.playCraft();
    const outName = getItemName(recipe.outputId) || getItemDef(recipe.outputId).name;
    this.onToast(t('toastCraftSuccess', { name: outName, count: recipe.outputCount }));
    this.renderHotbar();
    this.renderModalContent();
  }

  public renderHotbar(): void {
    this.hotbarEl.innerHTML = '';
    const creative = this.isCreativeMode();

    this.hotbar.forEach((slot, idx) => {
      const slotEl = document.createElement('div');
      slotEl.className = `hotbar-slot${idx === this.selectedIndex ? ' active' : ''}`;
      slotEl.addEventListener('click', () => this.selectSlot(idx));

      const keySpan = document.createElement('span');
      keySpan.className = 'slot-key';
      keySpan.textContent = String(idx + 1);
      slotEl.appendChild(keySpan);

      if (slot.itemId !== BlockId.Air && slot.count > 0) {
        const iconCanvas = document.createElement('canvas');
        this.atlas.renderItemIconToCanvas(slot.itemId, iconCanvas);
        slotEl.appendChild(iconCanvas);

        const countSpan = document.createElement('span');
        countSpan.className = 'slot-count';
        countSpan.textContent = creative ? '∞' : String(slot.count);
        slotEl.appendChild(countSpan);
      }

      this.hotbarEl.appendChild(slotEl);
    });

    const currentId = this.getSelectedItemId();
    const def = getItemDef(currentId);
    this.selectedLabelEl.textContent =
      currentId === BlockId.Air ? t('emptyHand') : getItemName(currentId) || def.name;
  }

  public renderModalContent(): void {
    if (!this.isModalOpen) return;

    // 1. 創造物品庫
    this.catalogGridEl.innerHTML = '';
    const allItems = Object.values(ITEM_REGISTRY).filter(
      (item) =>
        item.id !== BlockId.Air &&
        item.id !== BlockId.Bedrock &&
        item.id !== BlockId.OakDoorTop &&
        item.id !== BlockId.OakDoorOpen &&
        item.id !== BlockId.OakDoorTopOpen
    );

    for (const item of allItems) {
      const card = document.createElement('div');
      card.className = 'item-slot';

      const icon = document.createElement('canvas');
      this.atlas.renderItemIconToCanvas(item.id, icon);
      card.appendChild(icon);

      const itemName = getItemName(item.id) || item.name;
      const nameEl = document.createElement('div');
      nameEl.className = 'item-name';
      nameEl.textContent = itemName;
      card.appendChild(nameEl);

      const tagEl = document.createElement('div');
      tagEl.className = 'item-tag';
      tagEl.textContent = item.isBlock
        ? `${getBlockMaterialLabel(item)} · ${t('tagHardness', { sec: item.hardness })}`
        : item.toolType
        ? `${t('tagTool')} · ${t('tagDamage', { dmg: item.attackDamage ?? 2 })}${
            item.toolMultiplier && item.toolType !== 'sword'
              ? ` · ${t('tagEfficiency', { mult: item.toolMultiplier })}`
              : ''
          }`
        : item.foodRestore
        ? t('tagFood')
        : t('tagMaterial');
      card.appendChild(tagEl);

      card.addEventListener('click', () => {
        if (this.isCreativeMode()) {
          this.hotbar[this.selectedIndex] = {
            itemId: item.id,
            count: item.isBlock ? 64 : 1,
          };
          this.sound.playPop();
          this.renderHotbar();
          this.onHotbarChange?.();
          const currentName = getItemName(item.id) || item.name;
          this.onToast(t('toastEquipSlot', { name: currentName, slot: this.selectedIndex + 1 }));
        } else {
          this.onToast(t('toastSurvivalCatalogHint'));
        }
      });

      this.catalogGridEl.appendChild(card);
    }

    // 2. 生存合成配方
    this.craftingListEl.innerHTML = '';
    for (const recipe of CRAFTING_RECIPES) {
      const outDef = getItemDef(recipe.outputId);
      const outName = getItemName(recipe.outputId) || outDef.name;
      const craftable = this.canCraft(recipe);

      const card = document.createElement('div');
      card.className = `craft-card ${craftable ? 'can-craft' : 'cannot-craft'}`;

      const header = document.createElement('div');
      header.className = 'craft-header';

      const icon = document.createElement('canvas');
      this.atlas.renderItemIconToCanvas(recipe.outputId, icon);
      header.appendChild(icon);

      const info = document.createElement('div');
      const title = document.createElement('div');
      title.className = 'craft-title';
      title.textContent = `${outName} ×${recipe.outputCount}`;
      const desc = document.createElement('div');
      desc.className = 'craft-desc';
      desc.textContent = getRecipeDesc(recipe.id, recipe.description);
      info.appendChild(title);
      info.appendChild(desc);
      header.appendChild(info);
      card.appendChild(header);

      const ingBox = document.createElement('div');
      ingBox.className = 'craft-ingredients';
      const ingTexts = recipe.ingredients.map((ing) => {
        const ingName = getItemName(ing.itemId) || getItemDef(ing.itemId).name;
        const have = this.getItemTotalCount(ing.itemId);
        return `${ingName} ${have}/${ing.count}`;
      });
      ingBox.textContent = `${t('ingredientsPrefix')}${ingTexts.join(' + ')}`;
      card.appendChild(ingBox);

      card.addEventListener('click', () => this.craft(recipe));
      this.craftingListEl.appendChild(card);
    }

    // 3. 背包儲物格
    this.bagGridEl.innerHTML = '';
    this.bag.forEach((slot, bagIdx) => {
      const card = document.createElement('div');
      card.className = 'item-slot';

      if (slot.itemId !== BlockId.Air && slot.count > 0) {
        const def = getItemDef(slot.itemId);
        const itemName = getItemName(slot.itemId) || def.name;
        const icon = document.createElement('canvas');
        this.atlas.renderItemIconToCanvas(slot.itemId, icon);
        card.appendChild(icon);

        const nameEl = document.createElement('div');
        nameEl.className = 'item-name';
        nameEl.textContent = `${itemName} ×${slot.count}`;
        card.appendChild(nameEl);
      } else {
        const emptyEl = document.createElement('div');
        emptyEl.className = 'item-tag';
        emptyEl.style.padding = '18px 0';
        emptyEl.textContent = t('emptyBagSlot');
        card.appendChild(emptyEl);
      }

      card.addEventListener('click', () => {
        // 與當前選中的快捷欄格位交換
        const temp = { ...this.hotbar[this.selectedIndex] };
        this.hotbar[this.selectedIndex] = { ...this.bag[bagIdx] };
        this.bag[bagIdx] = temp;
        this.sound.playPop();
        this.renderHotbar();
        this.renderModalContent();
        this.onHotbarChange?.();
      });

      this.bagGridEl.appendChild(card);
    });
  }
}
