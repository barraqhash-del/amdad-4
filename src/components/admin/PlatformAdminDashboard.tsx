import React, { useState, useRef } from "react";
import {
  Factory,
  Product,
  WholesalerProfile,
  MainOrder,
  MerchantSaleOrder,
  FactoryCategory,
  FactoryCategoryInfo,
  SubscriptionTier,
  BillingCycle,
} from "../../types";
import { storeService } from "../../services/storeService";
import { TechControlPanel, TechTabOption } from "../ui/TechControlPanel";
import {
  Building2,
  Users,
  TrendingUp,
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ShoppingBag,
  DollarSign,
  Activity,
  Calendar,
  Phone,
  MapPin,
  FileText,
  Truck,
  Edit,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Award,
  Eye,
  Store,
  ChevronRight,
  ArrowUpRight,
  Clock,
  Tag,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  AlertTriangle,
  Settings,
  Send,
  Megaphone,
  Globe,
  Mail,
  Bell,
  Key,
  CreditCard,
} from "lucide-react";
import { SubscriptionManagement } from "./SubscriptionManagement";

interface Props {
  factories: Factory[];
  products: Product[];
  wholesaler: WholesalerProfile;
  orders: MainOrder[];
  merchantSales: MerchantSaleOrder[];
  onOpenCart?: () => void;
}

export type AdminSubTab =
  | "SUBSCRIBED_FACTORIES"
  | "SUBSCRIBED_MERCHANTS"
  | "MANAGE_SUBSCRIPTIONS"
  | "CUSTOMER_ACTIVITIES"
  | "MANAGE_FACTORIES"
  | "MANAGE_PRODUCTS"
  | "MANAGE_CATEGORIES"
  | "PLATFORM_SETTINGS";

export const PlatformAdminDashboard: React.FC<Props> = ({
  factories,
  products,
  wholesaler,
  orders,
  merchantSales,
}) => {
  const [activeSubTab, setActiveSubTab] =
    useState<AdminSubTab | null>(null);

  // State for Add Merchant Form Modal
  const [isAddMerchantOpen, setIsAddMerchantOpen] = useState(false);
  const [newMerchantStoreName, setNewMerchantStoreName] = useState("");
  const [newMerchantOwnerName, setNewMerchantOwnerName] = useState("");
  const [newMerchantEmail, setNewMerchantEmail] = useState("");
  const [newMerchantPassword, setNewMerchantPassword] = useState("123456");
  const [newMerchantPhone, setNewMerchantPhone] = useState("771234567");
  const [newMerchantCR, setNewMerchantCR] = useState("1010889900");
  const [newMerchantCity, setNewMerchantCity] = useState("صنعاء");
  const [newMerchantDistrict, setNewMerchantDistrict] = useState("العاصمة");
  const [newMerchantAddress, setNewMerchantAddress] = useState("شارع الخمسين");
  const [newMerchantTier, setNewMerchantTier] = useState<SubscriptionTier>("PROFESSIONAL");
  const [newMerchantBillingCycle, setNewMerchantBillingCycle] = useState<BillingCycle>("YEARLY");
  const [merchantSubCategoryFilter, setMerchantSubCategoryFilter] = useState<"ALL" | "MONTHLY" | "YEARLY" | "PENDING_UPGRADES">("ALL");
  const [newMerchantAutoApprove, setNewMerchantAutoApprove] = useState(true);

  const handleCreateMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerchantStoreName.trim() || !newMerchantOwnerName.trim() || !newMerchantEmail.trim()) {
      alert("يرجى إدخال البيانات الأساسية للتاجر (اسم المتجر، اسم المالك، والبريد الإلكتروني)");
      return;
    }
    const newAcc = storeService.registerMerchantAccount({
      email: newMerchantEmail.trim(),
      password: newMerchantPassword.trim() || "123456",
      storeName: newMerchantStoreName.trim(),
      ownerName: newMerchantOwnerName.trim(),
      phone: newMerchantPhone.trim(),
      commercialReg: newMerchantCR.trim() || "1010889900",
      city: newMerchantCity,
      district: newMerchantDistrict,
      fullAddress: newMerchantAddress,
      selectedTier: newMerchantTier,
      selectedBillingCycle: newMerchantBillingCycle,
    });

    if (newMerchantAutoApprove) {
      storeService.approveMerchantAccount(newAcc.id);
    }

    setIsAddMerchantOpen(false);
    setNewMerchantStoreName("");
    setNewMerchantOwnerName("");
    setNewMerchantEmail("");
    setStatusMessage(`🏬 تم إضافة حساب التاجر/المتجر "${newAcc.storeName}" بنجاح ${newMerchantAutoApprove ? "ومُعتمد ونشط 🟢" : "وقيد المراجعة ⏳"}!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // State for Add Factory Form Modal
  const [isAddFactoryOpen, setIsAddFactoryOpen] = useState(false);
  const [newFactoryName, setNewFactoryName] = useState("");
  const [newFactoryOwnerName, setNewFactoryOwnerName] = useState("");
  const [newFactoryCategory, setNewFactoryCategory] =
    useState<FactoryCategory>("food");
  const [newFactoryCity, setNewFactoryCity] = useState("صنعاء");
  const [newFactoryDistrict, setNewFactoryDistrict] = useState("منطقة الحصبة الصناعية");
  const [newFactoryAddress, setNewFactoryAddress] = useState("شارع الخمسين، القطعة 12");
  const [newFactoryPhone, setNewFactoryPhone] = useState("771234567");
  const [newFactoryEmail, setNewFactoryEmail] = useState("info@factory.ye");
  const [newFactoryPassword, setNewFactoryPassword] = useState("123456");
  const [newFactoryCR, setNewFactoryCR] = useState("1010892341");
  const [newFactoryMinOrder, setNewFactoryMinOrder] = useState(1000);
  const [newFactoryPrepHours, setNewFactoryPrepHours] = useState(24);
  const [newFactoryLogo, setNewFactoryLogo] = useState(
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&auto=format&fit=crop&q=60"
  );
  const factoryLogoFileInputRef = useRef<HTMLInputElement>(null);
  const [factoryLogoMode, setFactoryLogoMode] = useState<"FILE" | "URL">("FILE");
  const [factoryLogoPreview, setFactoryLogoPreview] = useState<string>("");

  const handleFactoryLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert("حجم الصورة كبير، يرجى اختيار صورة أقل من 8 ميجابايت.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFactoryLogoPreview(base64);
        setNewFactoryLogo(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // State for Add Product Form Modal
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedFactoryIdForProduct, setSelectedFactoryIdForProduct] =
    useState<string>(factories[0]?.id || "");
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("مواد غذائية");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdPrice, setNewProdPrice] = useState(100);
  const [newProdUnit, setNewProdUnit] = useState("كرتونة (24 حبة)");
  const [newProdStock, setNewProdStock] = useState(500);
  const [newProdMinQty, setNewProdMinQty] = useState(10);
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdBarcode, setNewProdBarcode] = useState("");
  const [newProdImage, setNewProdImage] = useState(
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60"
  );
  const prodImageFileInputRef = useRef<HTMLInputElement>(null);
  const [prodImageMode, setProdImageMode] = useState<"FILE" | "URL">("FILE");
  const [prodImagePreview, setProdImagePreview] = useState<string>("");

  const handleProdImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert("حجم الصورة كبير، يرجى اختيار صورة أقل من 8 ميجابايت.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProdImagePreview(base64);
        setNewProdImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState("ALL");

  // Selected Activity Detail Modal
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<any>(null);

  // Compute Platform Aggregates
  let totalWholesaleVolume = 0;
  orders.forEach((o) => {
    totalWholesaleVolume += o.totalAmount;
  });

  let totalRetailVolume = 0;
  merchantSales.forEach((s) => {
    totalRetailVolume += s.totalAmount;
  });

  const totalPlatformTurnover = totalWholesaleVolume + totalRetailVolume;

  // Stateful list of Subscribed Merchants/Wholesalers & Factories in platform
  const [subscribedMerchants, setSubscribedMerchants] = useState(() => storeService.getMerchantAccounts());
  const [subscribedFactoriesAccounts, setSubscribedFactoriesAccounts] = useState(() => storeService.getFactoryAccounts());

  // Selection states for simultaneous multi-deletion of factories & merchants
  const [selectedFactoryIds, setSelectedFactoryIds] = useState<string[]>([]);
  const [selectedMerchantIds, setSelectedMerchantIds] = useState<string[]>([]);

  // Edit Factory Account Modal State
  const [editingFactoryAccount, setEditingFactoryAccount] = useState<any | null>(null);
  const [editFacName, setEditFacName] = useState("");
  const [editFacOwner, setEditFacOwner] = useState("");
  const [editFacUsername, setEditFacUsername] = useState("");
  const [editFacEmail, setEditFacEmail] = useState("");
  const [editFacPhone, setEditFacPhone] = useState("");
  const [editFacCommReg, setEditFacCommReg] = useState("");
  const [editFacCategory, setEditFacCategory] = useState("FOOD");
  const [editFacCity, setEditFacCity] = useState("صنعاء");
  const [editFacDistrict, setEditFacDistrict] = useState("");
  const [editFacAddress, setEditFacAddress] = useState("");
  const [editFacPassword, setEditFacPassword] = useState("");
  const [editFacMinOrder, setEditFacMinOrder] = useState<number>(50000);
  const [editFacPrepHours, setEditFacPrepHours] = useState<number>(24);

  // Edit Merchant Account Modal State
  const [editingMerchantAccount, setEditingMerchantAccount] = useState<any | null>(null);
  const [editMerchStoreName, setEditMerchStoreName] = useState("");
  const [editMerchOwner, setEditMerchOwner] = useState("");
  const [editMerchUsername, setEditMerchUsername] = useState("");
  const [editMerchEmail, setEditMerchEmail] = useState("");
  const [editMerchPhone, setEditMerchPhone] = useState("");
  const [editMerchCommReg, setEditMerchCommReg] = useState("");
  const [editMerchCity, setEditMerchCity] = useState("صنعاء");
  const [editMerchDistrict, setEditMerchDistrict] = useState("");
  const [editMerchAddress, setEditMerchAddress] = useState("");
  const [editMerchPassword, setEditMerchPassword] = useState("");

  const handleOpenEditFactory = (facAcc: any, matchingFactory?: Factory) => {
    setEditingFactoryAccount(facAcc);
    setEditFacName(facAcc.factoryName || matchingFactory?.name || "");
    setEditFacOwner(facAcc.ownerName || "");
    setEditFacUsername(facAcc.username || "");
    setEditFacEmail(facAcc.email || matchingFactory?.email || "");
    setEditFacPhone(facAcc.phone || matchingFactory?.phone || "");
    setEditFacCommReg(facAcc.commercialReg || matchingFactory?.commercialReg || "");
    setEditFacCategory(facAcc.category || matchingFactory?.category || "FOOD");
    setEditFacCity(facAcc.city || matchingFactory?.city || "صنعاء");
    setEditFacDistrict(facAcc.district || matchingFactory?.district || "");
    setEditFacAddress(facAcc.fullAddress || matchingFactory?.fullAddress || matchingFactory?.address || "");
    setEditFacPassword("");
    setEditFacMinOrder(matchingFactory?.minOrderValue || 50000);
    setEditFacPrepHours(matchingFactory?.avgPreparationHours || matchingFactory?.preparationHours || 24);
  };

  const handleSaveEditFactory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFactoryAccount) return;

    storeService.updateFactoryAccountDetails(editingFactoryAccount.id, {
      factoryName: editFacName,
      ownerName: editFacOwner,
      username: editFacUsername,
      email: editFacEmail,
      phone: editFacPhone,
      commercialReg: editFacCommReg,
      category: editFacCategory,
      city: editFacCity,
      district: editFacDistrict,
      fullAddress: editFacAddress,
      password: editFacPassword,
      minOrderValue: editFacMinOrder,
      preparationHours: editFacPrepHours,
    });

    setEditingFactoryAccount(null);
    setStatusMessage(`✅ تم تحديث بيانات المصنع (${editFacName}) بنجاح.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleOpenEditMerchant = (merch: any) => {
    setEditingMerchantAccount(merch);
    setEditMerchStoreName(merch.storeName || "");
    setEditMerchOwner(merch.ownerName || "");
    setEditMerchUsername(merch.username || "");
    setEditMerchEmail(merch.email || "");
    setEditMerchPhone(merch.phone || "");
    setEditMerchCommReg(merch.commercialReg || "");
    setEditMerchCity(merch.city || "صنعاء");
    setEditMerchDistrict(merch.district || "");
    setEditMerchAddress(merch.fullAddress || "");
    setEditMerchPassword("");
  };

  const handleSaveEditMerchant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMerchantAccount) return;

    storeService.updateMerchantAccountDetails(editingMerchantAccount.id, {
      storeName: editMerchStoreName,
      ownerName: editMerchOwner,
      username: editMerchUsername,
      email: editMerchEmail,
      phone: editMerchPhone,
      commercialReg: editMerchCommReg,
      city: editMerchCity,
      district: editMerchDistrict,
      fullAddress: editMerchAddress,
      password: editMerchPassword,
    });

    setEditingMerchantAccount(null);
    setStatusMessage(`✅ تم تحديث بيانات التاجر (${editMerchStoreName}) بنجاح.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Generic Delete Confirmation Modal state
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Subscribe to store updates
  React.useEffect(() => {
    const unsubscribe = storeService.subscribe(() => {
      setSubscribedMerchants(storeService.getMerchantAccounts());
      setSubscribedFactoriesAccounts(storeService.getFactoryAccounts());
    });
    return unsubscribe;
  }, []);

  const toggleSelectFactory = (id: string) => {
    setSelectedFactoryIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllFactories = () => {
    if (selectedFactoryIds.length === subscribedFactoriesAccounts.length) {
      setSelectedFactoryIds([]);
    } else {
      setSelectedFactoryIds(subscribedFactoriesAccounts.map((f) => f.id));
    }
  };

  const toggleSelectMerchant = (id: string) => {
    setSelectedMerchantIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllMerchants = () => {
    if (selectedMerchantIds.length === subscribedMerchants.length) {
      setSelectedMerchantIds([]);
    } else {
      setSelectedMerchantIds(subscribedMerchants.map((m) => m.id));
    }
  };

  const handleBulkDeleteFactoriesAndMerchants = () => {
    const fCount = selectedFactoryIds.length;
    const mCount = selectedMerchantIds.length;
    if (fCount === 0 && mCount === 0) return;

    let confirmMsg = "";
    if (fCount > 0 && mCount > 0) {
      confirmMsg = `هل أنت متأكد من حذف (${fCount}) مصنع و (${mCount}) تاجر محددين في نفس الوقت؟ سيتم حذف جميع بياناتهم وسجلاتهم نهائياً.`;
    } else if (fCount > 0) {
      confirmMsg = `هل أنت متأكد من حذف (${fCount}) مصنع محدد في نفس الوقت؟`;
    } else {
      confirmMsg = `هل أنت متأكد من حذف (${mCount}) تاجر محدد في نفس الوقت؟`;
    }

    setDeleteConfirmItem({
      title: `حذف متعدد (${fCount + mCount} منشأة)`,
      message: confirmMsg,
      onConfirm: () => {
        storeService.deleteMultipleFactoriesAndMerchants(selectedFactoryIds, selectedMerchantIds);
        setSelectedFactoryIds([]);
        setSelectedMerchantIds([]);
        setStatusMessage(`🗑️ تم حذف العناصر المحضرة بنجاح!`);
        setTimeout(() => setStatusMessage(null), 4000);
      },
    });
  };

  const handleApproveFactoryAccount = (id: string, name: string) => {
    storeService.approveFactoryAccount(id);
    setStatusMessage(`🟢 تم منح الموافقة والاعتماد لحساب المصنع: "${name}" بنجاح!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSuspendFactoryAccount = (id: string, name: string) => {
    storeService.suspendFactoryAccount(
      id,
      "تم إيقاف حساب المصنع مؤقتاً لتحديث تراخيص البيئة والسلامة الصناعية مع الإدارة."
    );
    setStatusMessage(`⛔ تم إيقاف حساب المصنع مؤقتاً: "${name}".`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDeleteFactoryAccount = (id: string, name: string) => {
    setDeleteConfirmItem({
      title: `حساب المصنع: ${name}`,
      message: `هل أنت متأكد من رغبتك في حذف حساب المصنع "${name}" نهائياً من المنصة؟ سيتم إزالة كافة البيانات والمنتجات والسجلات التابعة له.`,
      onConfirm: () => {
        storeService.deleteFactoryAccount(id);
        storeService.deleteFactory(id);
        setStatusMessage(`🗑️ تم حذف حساب المصنع "${name}" بنجاح.`);
        setTimeout(() => setStatusMessage(null), 4000);
      },
    });
  };

  const handleApproveMerchant = (id: string, name: string) => {
    storeService.approveMerchantAccount(id);
    setStatusMessage(`🟢 تم منح الموافقة والاعتماد للحساب: "${name}" بنجاح!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSuspendMerchant = (id: string, name: string) => {
    storeService.suspendMerchantAccount(
      id,
      "تم إيقاف الخدمة مؤقتاً بواسطة إدارة المنصة لمراجعة السجلات والترخيص التجاري."
    );
    setStatusMessage(`⛔ تم إيقاف الخدمة مؤقتاً للمتجر: "${name}". سيظهر للتاجر إشعار التواصل بخدمة العملاء.`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleChangeMerchantTier = (id: string, name: string, tier: SubscriptionTier, cycle?: BillingCycle) => {
    const account = storeService.getMerchantAccounts().find(a => a.id === id);
    const activeCycle = cycle || account?.subscription?.billingCycle || "YEARLY";
    storeService.updateMerchantSubscription(id, tier, activeCycle);
    setSubscribedMerchants(storeService.getMerchantAccounts());
    setStatusMessage(`💳 تم تعديل باقة الاشتراك للمتجر: "${name}" بنجاح!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleChangeMerchantBillingCycle = (id: string, name: string, cycle: BillingCycle) => {
    const account = storeService.getMerchantAccounts().find(a => a.id === id);
    const activeTier = account?.subscription?.planId || "PROFESSIONAL";
    storeService.updateMerchantSubscription(id, activeTier, cycle);
    setSubscribedMerchants(storeService.getMerchantAccounts());
    setStatusMessage(`📅 تم تعديل فئة ونظام الاشتراك إلى ${cycle === "YEARLY" ? "الاشتراك السنوي ⭐" : "الاشتراك الشهري 🗓️"} للمتجر: "${name}" بنجاح!`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleApproveSubscriptionUpgrade = (id: string, name: string, planName?: string) => {
    storeService.approveMerchantSubscriptionUpgrade(id);
    setSubscribedMerchants(storeService.getMerchantAccounts());
    setStatusMessage(`🟢 تمت الموافقة واعتماد ترقية باقة المتجر "${name}" إلى "${planName || 'الباقة المطلوبة'}" بنجاح!`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleRejectSubscriptionUpgrade = (id: string, name: string) => {
    storeService.rejectMerchantSubscriptionUpgrade(id);
    setSubscribedMerchants(storeService.getMerchantAccounts());
    setStatusMessage(`❌ تم رفض طلب ترقية الباقة للمتجر "${name}".`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDeleteMerchantAccount = (id: string, name: string) => {
    setDeleteConfirmItem({
      title: `حساب التاجر: ${name}`,
      message: `هل أنت متأكد من رغبتك في حذف حساب التاجر/المتجر "${name}" نهائياً؟ سيتم إلغاء اشتراكه وتأكيد حذف سجلاته من المنصة.`,
      onConfirm: () => {
        storeService.deleteMerchantAccount(id);
        setStatusMessage(`🗑️ تم حذف حساب التاجر "${name}" بنجاح.`);
        setTimeout(() => setStatusMessage(null), 4000);
      },
    });
  };

  // Category mapping
  const categoryNamesAr: Record<FactoryCategory, string> = {
    food: "مواد غذائية وزيوت",
    plastics: "بلاستيك وتغليف",
    detergents: "منظفات ومعقمات",
    beverages: "مياه ومشروبات",
    paper: "منتجات ورقية",
  };

  // State for Manage Categories
  const categoriesList = storeService.getCategories();
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [newCatId, setNewCatId] = useState("");
  const [newCatNameAr, setNewCatNameAr] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const [editingCat, setEditingCat] = useState<FactoryCategoryInfo | null>(null);
  const [editCatNameAr, setEditCatNameAr] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");

  const [deletingCat, setDeletingCat] = useState<FactoryCategoryInfo | null>(null);

  // Handlers for Categories
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameAr.trim()) {
      alert("يرجى إدخال اسم التصنيف بالعربي");
      return;
    }
    storeService.addCategory({
      id: newCatId.trim() || `cat_${Date.now()}`,
      nameAr: newCatNameAr.trim(),
      description: newCatDesc.trim(),
    });
    setIsAddCategoryOpen(false);
    setNewCatId("");
    setNewCatNameAr("");
    setNewCatDesc("");
    setStatusMessage("🏷️ تم إضافة التصنيف الرئيسي الجديد بنجاح!");
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editCatNameAr.trim()) return;
    storeService.updateCategory(editingCat.id, {
      nameAr: editCatNameAr.trim(),
      description: editCatDesc.trim(),
    });
    setEditingCat(null);
    setStatusMessage("✏️ تم تحديث بيانات التصنيف بنجاح!");
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDeleteCategory = (cat: FactoryCategoryInfo) => {
    setDeletingCat(cat);
  };

  const confirmDeleteCategory = () => {
    if (!deletingCat) return;
    const catName = deletingCat.nameAr;
    storeService.deleteCategory(deletingCat.id);
    setDeletingCat(null);
    setStatusMessage(`🗑️ تم حذف التصنيف الرئيسي "${catName}" بنجاح.`);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Handlers for Add Factory
  const handleCreateFactory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactoryName.trim()) {
      alert("يرجى أدخال اسم المصنع");
      return;
    }

    const catObj = categoriesList.find((c) => c.id === newFactoryCategory);

    storeService.addFactory({
      name: newFactoryName.trim(),
      category: newFactoryCategory,
      categoryNameAr: catObj ? catObj.nameAr : "عام",
      logo:
        factoryLogoPreview ||
        newFactoryLogo ||
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&auto=format&fit=crop&q=60",
      city: newFactoryCity,
      district: newFactoryDistrict,
      address: newFactoryAddress,
      phone: newFactoryPhone,
      email: newFactoryEmail.trim() || `factory_${Date.now()}@emdad.ye`,
      password: newFactoryPassword.trim() || "123456",
      ownerName: newFactoryOwnerName.trim() || "إدارة المصنع",
      rating: 5.0,
      ordersFulfilled: 0,
      verified: true,
      minOrderValue: Number(newFactoryMinOrder) || 1000,
      avgPreparationHours: Number(newFactoryPrepHours) || 24,
      commercialReg: newFactoryCR || "1010009988",
    });

    setStatusMessage(`🏭 تمت إضافة المصنع "${newFactoryName}" وحساب دخوله بنجاح!`);
    setTimeout(() => setStatusMessage(null), 4000);
    setIsAddFactoryOpen(false);
    setNewFactoryName("");
    setNewFactoryOwnerName("");
    setFactoryLogoPreview("");
  };

  // Handlers for Add Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      alert("يرجى إدخال اسم المنتج");
      return;
    }

    const targetFactory =
      factories.find((f) => f.id === selectedFactoryIdForProduct) || factories[0];

    const generatedSku =
      newProdSku.trim().toUpperCase() ||
      `PRD-${Math.floor(1000 + Math.random() * 9000)}`;

    const generatedBarcode =
      newProdBarcode.trim() ||
      `628${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    storeService.addProduct({
      id: "p-" + Date.now(),
      factoryId: targetFactory.id,
      factoryName: targetFactory.name,
      name: newProdName.trim(),
      description:
        newProdDesc.trim() ||
        "منتج جملة عالي الجودة مطابق للمواصفات والمقاييس السعودية ISO-9001",
      category: newProdCategory,
      price: Number(newProdPrice) || 50,
      unit: newProdUnit.trim() || "كرتونة (24 حبة)",
      stock: Number(newProdStock) || 100,
      minQuantity: Number(newProdMinQty) || 5,
      image:
        newProdImage ||
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60",
      sku: generatedSku,
      barcode: generatedBarcode,
      isAvailable: true,
    });

    alert(
      `تمت إضافة المنتج "${newProdName}" بنجاح إلى كتالوج "${targetFactory.name}" 🛒`
    );
    setIsAddProductOpen(false);
    setNewProdName("");
    setNewProdDesc("");
    setProdImagePreview("");
  };

  const handleDeleteFactory = (id: string, name: string) => {
    setDeleteConfirmItem({
      title: `المصنع: ${name}`,
      message: `هل أنت متأكد من رغبتك في حذف المصنع "${name}" نهائياً من المنصة؟ سيتم حذف جميع المنتجات والحساب الخاص به.`,
      onConfirm: () => {
        storeService.deleteFactory(id);
        storeService.deleteFactoryAccount(id);
        setStatusMessage(`🗑️ تم حذف المصنع "${name}" بنجاح.`);
        setTimeout(() => setStatusMessage(null), 4000);
      },
    });
  };

  const handleDeleteProduct = (id: string, name: string) => {
    setDeleteConfirmItem({
      title: `المنتج: ${name}`,
      message: `هل أنت متأكد من رغبتك في حذف المنتج "${name}" نهائياً من الكتالوج؟`,
      onConfirm: () => {
        storeService.deleteProduct(id);
        setStatusMessage(`🗑️ تم حذف المنتج "${name}" بنجاح.`);
        setTimeout(() => setStatusMessage(null), 4000);
      },
    });
  };

  const handleDeleteMerchant = (id: string, name: string) => {
    setDeleteConfirmItem({
      title: `التاجر: ${name}`,
      message: `هل أنت متأكد من رغبتك في حذف التاجر/المتجر "${name}" نهائياً من المنصة؟`,
      onConfirm: () => {
        storeService.deleteMerchantAccount(id);
        setStatusMessage(`🗑️ تم حذف التاجر "${name}" بنجاح.`);
        setTimeout(() => setStatusMessage(null), 4000);
      },
    });
  };

  const handleDeleteCustomerActivity = (id: string, type: string, title: string) => {
    setDeleteConfirmItem({
      title: `السجل: ${title}`,
      message: `هل أنت متأكد من رغبتك في حذف سجل الحركة "${title}" من قائمة أنشطة المنصة؟`,
      onConfirm: () => {
        if (type === "WHOLESALE_ORDER") {
          storeService.deleteSubOrder(id);
        } else if (type === "RETAIL_SALE") {
          storeService.deleteMerchantSale(id);
        }
        setStatusMessage(`🗑️ تم حذف السجل بنجاح.`);
        setTimeout(() => setStatusMessage(null), 4000);
      },
    });
  };

  const handleToggleFactoryVerify = (factory: Factory) => {
    storeService.updateFactory(factory.id, { verified: !factory.verified });
  };

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleWipeAllData = () => {
    if (confirm("هل أنت تأكد من تصفير وإزالة كافة البيانات والأصناف التجريبية وتجهيز جميع المنصات للعمل الفعلي؟")) {
      storeService.clearAllDemoData();
      setStatusMessage("🧹 تم تصفير كافة الأصناف والبيانات التجريبية بنجاح! المنظومة بالكامل الآن جاهزة للبدء والإنطلاق الفعلي.");
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleResetDefaultData = () => {
    storeService.resetToDefault();
    setStatusMessage("🔄 تمت استعادة البيانات الافتراضية التجريبية للمنصة بنجاح.");
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Platform Settings State
  const [platformName, setPlatformName] = useState(wholesaler?.storeName || "منصة إمداد B2B المركزية");
  const [platformOwner, setPlatformOwner] = useState(wholesaler?.ownerName || "إدارة التوريد والمنصة الموحدة");
  const [platformPhone, setPlatformPhone] = useState(wholesaler?.phone || "770000000");
  const [platformEmail, setPlatformEmail] = useState(wholesaler?.email || "info@emdad.ye");
  const [platformCity, setPlatformCity] = useState(wholesaler?.city || "صنعاء");
  const [platformDistrict, setPlatformDistrict] = useState(wholesaler?.district || "العاصمة");
  const [platformAddress, setPlatformAddress] = useState(wholesaler?.fullAddress || "شارع الخمسين، صنعاء");
  const [platformCR, setPlatformCR] = useState(wholesaler?.commercialReg || "1010889900");
  const [platformTaxNumber, setPlatformTaxNumber] = useState(wholesaler?.taxNumber || "3000998877");

  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storeService.updateWholesaler({
      ...wholesaler,
      storeName: platformName.trim(),
      ownerName: platformOwner.trim(),
      phone: platformPhone.trim(),
      email: platformEmail.trim(),
      city: platformCity.trim(),
      district: platformDistrict.trim(),
      fullAddress: platformAddress.trim(),
      commercialReg: platformCR.trim(),
      taxNumber: platformTaxNumber.trim(),
    });
    setStatusMessage("⚙️ تم تحديث إعدادات المنصة ورقم التواصل الرسمي بنجاح وتعميم البيانات حياً 🟢");
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Manual Broadcast & Notification State
  const [notifTargetRole, setNotifTargetRole] = useState<"FACTORY" | "WHOLESALER" | "ALL">("FACTORY");
  const [notifFactoryId, setNotifFactoryId] = useState<string>("ALL");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");

  const handleSendManualNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) {
      alert("يرجى كتابة عنوان وتفاصيل التعميم / الإشعار اليدوي");
      return;
    }

    const timestamp =
      new Date().toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }) +
      " - " +
      new Date().toLocaleDateString("ar-YE");

    if (notifTargetRole === "ALL") {
      storeService.addNotification({
        id: `notif-${Date.now()}-f`,
        targetRole: "FACTORY",
        factoryId: "ALL",
        title: `📢 تعميم الإدارة: ${notifTitle.trim()}`,
        message: notifMessage.trim(),
        timestamp,
        read: false,
        type: "ANNOUNCEMENT" as any,
      });
      storeService.addNotification({
        id: `notif-${Date.now()}-w`,
        targetRole: "WHOLESALER",
        title: `📢 تعميم الإدارة: ${notifTitle.trim()}`,
        message: notifMessage.trim(),
        timestamp,
        read: false,
        type: "ANNOUNCEMENT" as any,
      });
    } else if (notifTargetRole === "FACTORY") {
      storeService.addNotification({
        id: `notif-${Date.now()}`,
        targetRole: "FACTORY",
        factoryId: notifFactoryId,
        title: `📢 تعميم للمصانع: ${notifTitle.trim()}`,
        message: notifMessage.trim(),
        timestamp,
        read: false,
        type: "ANNOUNCEMENT" as any,
      });
    } else {
      storeService.addNotification({
        id: `notif-${Date.now()}`,
        targetRole: "WHOLESALER",
        title: `📢 إشعار للتجار: ${notifTitle.trim()}`,
        message: notifMessage.trim(),
        timestamp,
        read: false,
        type: "ANNOUNCEMENT" as any,
      });
    }

    setNotifTitle("");
    setNotifMessage("");
    const targetText =
      notifTargetRole === "ALL"
        ? "كافة مستخدمي المنصة 🌐"
        : notifTargetRole === "FACTORY"
        ? notifFactoryId === "ALL"
          ? "جميع المصانع المشتركة 🏭"
          : `مصنع محدد`
        : "جميع التجار والمحلات 🏬";

    setStatusMessage(`📢 تم إرسال التعميم اليدوي بنجاح إلى: ${targetText}`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // Compile unified Customer Movements Stream (Wholesale Orders + Retail Sales)
  const customerMovementsList = [
    ...orders.flatMap((mo) =>
      mo.subOrders.map((so) => ({
        id: so.id,
        type: "WHOLESALE_ORDER",
        title: `طلب جملة لمصنع: ${so.factoryName}`,
        clientName: mo.wholesaler.storeName,
        clientPhone: mo.wholesaler.phone,
        clientRole: "تاجر جملة",
        amount: so.total,
        status: so.status,
        date: so.createdAt,
        itemsCount: so.items.reduce((acc, i) => acc + i.quantity, 0),
        raw: so,
      }))
    ),
    ...merchantSales.map((ms) => ({
      id: ms.id,
      type: "RETAIL_SALE",
      title: `فاتورة بيع للزبون: ${ms.customerName}`,
      clientName: ms.customerName,
      clientPhone: ms.customerPhone,
      clientRole:
        ms.customerType === "RETAIL_STORE"
          ? "متجر تجزئة"
          : ms.customerType === "COMPANY"
          ? "شركة / مؤسسة"
          : "عميل مباشر (معرض)",
      amount: ms.totalAmount,
      status: ms.status,
      date: ms.createdAt,
      itemsCount: ms.items.reduce((acc, i) => acc + i.quantity, 0),
      raw: ms,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filtered customer movements
  const filteredCustomerMovements = customerMovementsList.filter((m) => {
    const matchesQuery =
      !searchQuery ||
      m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.clientPhone.includes(searchQuery) ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedCustomerFilter === "ALL" || m.type === selectedCustomerFilter;

    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-6 dir-rtl">
      {statusMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 px-5 py-3 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-between animate-in fade-in duration-300">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs underline text-emerald-600 dark:text-emerald-400">إغلاق</button>
        </div>
      )}

      {/* Top Banner & Platform Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-900/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight">
                لوحة التحكم والإدارة المنصة الموحدة (إمداد B2B)
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                منظومة نشطة
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              متابعة جميع المصانع المشتركة، التجار المشتركين، تحركات وحركات بيع العملاء، مع إدارة شاملة لكتالوج المنتجات
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 z-10 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab("PLATFORM_SETTINGS")}
            className="p-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 border border-purple-500/40 cursor-pointer"
            title="إعدادات المنصة والتعاميم الرسمية"
          >
            <Settings className="w-4.5 h-4.5 text-purple-300" />
            <span>إعدادات المنصة ⚙️</span>
          </button>

          <button
            onClick={() => setIsAddMerchantOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>إضافة تاجر جديد 🏬</span>
          </button>

          <button
            onClick={() => setIsAddFactoryOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مصنع 🏭</span>
          </button>

          <button
            onClick={() => setIsAddProductOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منتج 📦</span>
          </button>

          <button
            onClick={handleWipeAllData}
            className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            title="تصفير مسح كامل لكافة السجلات والطلبيات والمنتجات"
          >
            <Trash2 className="w-4 h-4" />
            <span>تصفير البيانات للبدء من جديد 🧹</span>
          </button>

          <button
            onClick={handleResetDefaultData}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-1 border border-slate-700 cursor-pointer"
            title="استعادة العينات والبيانات التجريبية الافتراضية"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>البيانات الافتراضية 🔄</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold">المصانع المشتركة والمعتمدة</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <strong className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {factories.length} مصنع
          </strong>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            {factories.filter((f) => f.verified).length} مصنع موثق ومفعل بالسجل
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold">التجار والمؤسسات المشتركة</span>
            <Store className="w-4 h-4 text-emerald-600" />
          </div>
          <strong className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {subscribedMerchants.length} تجار
          </strong>
          <span className="text-[10px] text-slate-400">
            عبر صنعاء، عدن، تعز، والحديدة
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold">إجمالي تداولات المنصة</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <strong className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 block">
            {totalPlatformTurnover.toLocaleString("ar-YE")} ر.ي
          </strong>
          <span className="text-[10px] text-slate-400">
            جملة ({totalWholesaleVolume.toLocaleString("ar-YE")}) + تجزئة (
            {totalRetailVolume.toLocaleString("ar-YE")})
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-bold">إجمالي منتجات المصانع</span>
            <Package className="w-4 h-4 text-amber-500" />
          </div>
          <strong className="text-2xl font-extrabold text-slate-900 dark:text-white block">
            {products.length} صنف جملة
          </strong>
          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
            جاهزة للطلب المباشر والتوريد
          </span>
        </div>
      </div>

      {/* High Tech Control Panel for Platform Admin */}
      <TechControlPanel
        title="شريط خيارات التحكم الإداري بالمنصة الموحدة"
        subtitle="التحكم الكامل بالمصانع المشتركة، حسابات التجار، حركة المبيعات، والتصنيفات"
        stats={[
          { label: "إجمالي التدوير المالي", value: `${(totalPlatformTurnover / 1000000).toFixed(2)} مليون ر.ي`, color: "text-emerald-600 dark:text-emerald-400 font-extrabold" },
          { label: "المصانع المشتركة", value: factories.length, color: "text-indigo-600 dark:text-indigo-400" },
          { label: "التجار والتاجر المباشر", value: subscribedMerchants.length, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "منتجات الكتالوج", value: products.length, color: "text-amber-500" },
        ]}
        tabs={[
          {
            id: "SUBSCRIBED_FACTORIES",
            label: "المصانع المشتركة والمعتمدة",
            subLabel: "عرض وإدارة حسابات المصانع، تعديل التراخيص السنوية أو توثيق العلامات التجارية",
            icon: Building2,
            badge: factories.length,
            color: "text-indigo-500",
          },
          {
            id: "SUBSCRIBED_MERCHANTS",
            label: "التجار والمتاجر المشتركة",
            subLabel: "إدارة الاشتراكات والتراخيص للمحلات وتجار الجملة مع التحكم في حالة الموافقة",
            icon: Store,
            badge:
              subscribedMerchants.filter((m) => m.pendingSubscriptionChange?.status === "PENDING_APPROVAL").length > 0
                ? `${subscribedMerchants.length} (${subscribedMerchants.filter((m) => m.pendingSubscriptionChange?.status === "PENDING_APPROVAL").length} طلب ترقية ⏳)`
                : subscribedMerchants.length,
            color: "text-emerald-500",
          },
          {
            id: "MANAGE_SUBSCRIPTIONS",
            label: "إدارة الاشتراكات والأسعار والعروض",
            subLabel: "تعديل خطط وباقات اشتراك التجار والمصانع، تحديث الأسعار، وإدارة العروض والخصومات والكبونات",
            icon: CreditCard,
            badge:
              subscribedMerchants.filter((m) => m.pendingSubscriptionChange?.status === "PENDING_APPROVAL").length > 0
                ? `${subscribedMerchants.filter((m) => m.pendingSubscriptionChange?.status === "PENDING_APPROVAL").length} طلب معلق`
                : undefined,
            color: "text-amber-500",
          },
          {
            id: "CUSTOMER_ACTIVITIES",
            label: "تحركات المبيعات والعملاء",
            subLabel: "متابعة سجلات عمليات الشراء والبيع بالفواتير والتفاصيل المالية الفورية",
            icon: Activity,
            badge: customerMovementsList.length,
            color: "text-cyan-500",
          },
          {
            id: "MANAGE_CATEGORIES",
            label: "التصنيفات الرئيسية",
            subLabel: "إضافة وتعديل الأقسام الرئيسية والفرعية لمنتجات المصانع",
            icon: Tag,
            badge: categoriesList.length,
            color: "text-amber-500",
          },
        ]}
        activeTabId={activeSubTab || undefined}
        onSelectTab={(id) => setActiveSubTab(id as AdminSubTab)}
      />

      {/* ========================================================= */}
      {/* FULL SCREEN STANDALONE VIEW FOR SELECTED CONTROL OPTION */}
      {/* ========================================================= */}
      {activeSubTab && (
        <div className="fixed inset-0 z-[100] bg-slate-100 dark:bg-slate-950 overflow-y-auto flex flex-col dir-rtl animate-in fade-in duration-200">
          {/* Top Sticky Bar */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3.5 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 shadow-md">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setActiveSubTab(null)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer shrink-0 hover:scale-[1.02]"
              >
                <ChevronRight className="w-4 h-4" />
                <span>العودة للوحة التحكم الرئيسية</span>
              </button>

              <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block shrink-0" />

              <div className="flex items-center gap-2.5 min-w-0">
                <h2 className="text-xs sm:text-sm md:text-base font-black text-slate-900 dark:text-white truncate">
                  {activeSubTab === "SUBSCRIBED_FACTORIES" && "المصانع والمؤسسات المشتركة بالمنصة"}
                  {activeSubTab === "SUBSCRIBED_MERCHANTS" && "التجار والمتاجر المشتركة"}
                  {activeSubTab === "MANAGE_SUBSCRIPTIONS" && "إدارة خطط الاشتراكات، الأسعار والعروض والخصومات"}
                  {activeSubTab === "CUSTOMER_ACTIVITIES" && "تحركات المبيعات والعملاء"}
                  {activeSubTab === "MANAGE_CATEGORIES" && "التصنيفات الرئيسية والفرعية"}
                  {activeSubTab === "PLATFORM_SETTINGS" && "إعدادات المنصة والتعاميم الرسمية"}
                  {activeSubTab === "MANAGE_FACTORIES" && "إدارة حسابات المصانع"}
                  {activeSubTab === "MANAGE_PRODUCTS" && "إدارة منتجات الكتالوج"}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubTab(null)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-500 hover:text-rose-600 dark:text-slate-400 transition-all cursor-pointer shrink-0"
              title="إغلاق الشاشة المستقلة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Standalone View Body */}
          <div className="p-4 sm:p-6 lg:p-8 w-full flex-1 space-y-6">
            {statusMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in">
                <span>{statusMessage}</span>
                <button onClick={() => setStatusMessage(null)} className="text-emerald-500 font-bold hover:text-emerald-800">✕</button>
              </div>
            )}

      {/* ========================================================= */}
      {/* SUBTAB 1: SUBSCRIBED FACTORIES DIRECTORY */}
      {/* ========================================================= */}
      {activeSubTab === "SUBSCRIBED_FACTORIES" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>المصانع والمؤسسات المشتركة بالمنصة</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold">
                      {subscribedFactoriesAccounts.length} مصنع
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    قائمة المصانع والشركات المسجلة بالمنصة، إدارة الاشتراكات وحالة الاعتماد والتوثيق والسجل التجاري
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddFactoryOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مصنع جديد 🏭</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">اسم المصنع / العلامة التجاري</th>
                    <th className="p-3">المدير والبريد الإلكتروني</th>
                    <th className="p-3">المدينة والتصنيف</th>
                    <th className="p-3">السجل التجاري</th>
                    <th className="p-3 text-center">باقة الاشتراك والمنتجات</th>
                    <th className="p-3 text-center">حالة الحساب والاعتماد</th>
                    <th className="p-3 text-center">إجراءات الإدارة ⚙️</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                  {subscribedFactoriesAccounts.map((facAcc) => {
                    const matchingFactory = factories.find(
                      (f) => f.id === facAcc.id || f.name === facAcc.factoryName
                    );
                    const isApproved = facAcc.approvalStatus === "APPROVED";
                    const isPending = facAcc.approvalStatus === "PENDING";
                    const isSuspended = facAcc.approvalStatus === "SUSPENDED";
                    const isSelected = selectedFactoryIds.includes(facAcc.id);
                    const logo =
                      matchingFactory?.logo ||
                      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&auto=format&fit=crop&q=60";
                    const prodsCount = products.filter(
                      (p) =>
                        p.factoryId === facAcc.id ||
                        p.factoryName === facAcc.factoryName ||
                        (matchingFactory && p.factoryId === matchingFactory.id)
                    ).length;

                    return (
                      <tr
                        key={facAcc.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={logo}
                              alt={facAcc.factoryName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{facAcc.factoryName}</span>
                                {matchingFactory?.verified && (
                                  <span className="text-[10px] text-emerald-600 font-bold" title="مصنع موثق بالسجل">✓</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono block">ID: {facAcc.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{facAcc.ownerName}</div>
                          {facAcc.username && (
                            <span className="text-[10px] font-mono font-extrabold text-indigo-600 dark:text-indigo-400 block dir-ltr text-right">
                              @{facAcc.username}
                            </span>
                          )}
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {facAcc.email}
                          </div>
                        </td>

                        <td className="p-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{facAcc.city}</div>
                          <span className="text-[10px] text-slate-400 block">
                            {matchingFactory?.categoryNameAr || "صناعات عامة"}
                          </span>
                        </td>

                        <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {facAcc.commercialReg}
                        </td>

                        <td className="p-3 text-center">
                          <div className="font-bold text-indigo-700 dark:text-indigo-300 text-[11px]">
                            {facAcc.subscription?.planNameAr || "الباقة الذهبية"}
                          </div>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <span className="text-[10px] text-slate-500">
                              {prodsCount} منتجات بالكتالوج
                            </span>
                            {matchingFactory && (
                              <button
                                onClick={() => {
                                  setSelectedFactoryIdForProduct(matchingFactory.id);
                                  setIsAddProductOpen(true);
                                }}
                                className="px-1.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold hover:bg-indigo-100"
                                title="إضافة منتج لكتالوج هذا المصنع"
                              >
                                + إضافة
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          {isApproved && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold inline-flex items-center gap-1">
                              <span>🟢</span>
                              <span>مُعتمد ونشط</span>
                            </span>
                          )}

                          {isPending && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black animate-pulse inline-flex items-center gap-1">
                              <span>⏳</span>
                              <span>بانتظار الموافقة</span>
                            </span>
                          )}

                          {isSuspended && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black inline-flex items-center gap-1">
                              <span>⛔</span>
                              <span>موقوف مؤقتاً</span>
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {(isPending || isSuspended) && (
                              <button
                                onClick={() => handleApproveFactoryAccount(facAcc.id, facAcc.factoryName)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center gap-1"
                                title="منح موافقة الإدارة وتفعيل حساب المصنع"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{isPending ? "اعتماد الموافقة 🟢" : "إعادة تفعيل 🟢"}</span>
                              </button>
                            )}

                            {isApproved && (
                              <button
                                onClick={() => handleSuspendFactoryAccount(facAcc.id, facAcc.factoryName)}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] shadow-xs transition-all flex items-center gap-1"
                                title="إيقاف الخدمة لمراجعة السجلات"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>إيقاف مؤقت ⛔</span>
                              </button>
                            )}

                             <button
                              onClick={() => handleOpenEditFactory(facAcc, matchingFactory)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                              title="تعديل معلومات المصنع"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteFactoryAccount(facAcc.id, facAcc.factoryName)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title="حذف حساب المصنع"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: SUBSCRIBED MERCHANTS DIRECTORY */}
      {/* ========================================================= */}
      {activeSubTab === "SUBSCRIBED_MERCHANTS" && (() => {
        const pendingUpgradeMerchants = subscribedMerchants.filter(
          (m) => !!m.pendingSubscriptionChange && m.pendingSubscriptionChange.status === "PENDING_APPROVAL"
        );
        const monthlyCount = subscribedMerchants.filter((m) => m.subscription.billingCycle === "MONTHLY").length;
        const yearlyCount = subscribedMerchants.filter(
          (m) => m.subscription.billingCycle === "YEARLY" || !m.subscription.billingCycle
        ).length;

        const filteredMerchantsList = subscribedMerchants.filter((m) => {
          if (merchantSubCategoryFilter === "PENDING_UPGRADES") {
            return !!m.pendingSubscriptionChange && m.pendingSubscriptionChange.status === "PENDING_APPROVAL";
          }
          if (merchantSubCategoryFilter === "MONTHLY") return m.subscription.billingCycle === "MONTHLY";
          if (merchantSubCategoryFilter === "YEARLY") return m.subscription.billingCycle === "YEARLY" || !m.subscription.billingCycle;
          return true;
        });

        return (
          <div className="space-y-6">
            {/* PENDING UPGRADE REQUESTS CALLOUT BANNER & CARDS */}
            {pendingUpgradeMerchants.length > 0 && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 border-2 border-amber-500/30 dark:border-amber-500/20 shadow-sm space-y-4 animate-in fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200/50 dark:border-amber-900/40 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md animate-bounce">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-amber-900 dark:text-amber-200 flex items-center gap-2">
                        <span>طلبات ترقية وتعديل الباقات الواردة من التجار بانتظار الموافقة</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-xs font-black shadow-xs">
                          {pendingUpgradeMerchants.length} طلب معلق
                        </span>
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        قام التجار بطلب ترقية باقاتهم، يرجى مراجعة التفاصيل والموافقة لاعتماد الباقة الجديدة فوراً.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {pendingUpgradeMerchants.map((merch) => {
                    const pending = merch.pendingSubscriptionChange!;
                    return (
                      <div
                        key={`pending-card-${merch.id}`}
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-300 dark:border-amber-800 shadow-sm flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-black text-slate-900 dark:text-white text-sm">
                                🏬 {merch.storeName}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                                المالك: {merch.ownerName} • {merch.phone}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                📍 {merch.city} - {merch.district}
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black animate-pulse">
                              ⏳ بانتظار الموافقة
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                            <div>
                              <div className="text-[10px] text-slate-500 font-bold">الباقة الحالية:</div>
                              <div className="font-black text-slate-700 dark:text-slate-300">
                                {merch.subscription.planNameAr}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">الباقة المطلوبة:</div>
                              <div className="font-black text-emerald-700 dark:text-emerald-300">
                                {pending.requestedPlanName}
                              </div>
                              <div className="text-[10px] font-mono text-slate-500">
                                السعر: {pending.price.toLocaleString("ar-YE")} ر.ي
                              </div>
                            </div>
                          </div>

                          {pending.note && (
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-amber-50/50 dark:bg-amber-950/30 p-2 rounded-lg">
                              💬 ملاحظة الطلب: {pending.note}
                            </div>
                          )}

                          <div className="text-[10px] text-slate-400 font-mono">
                            تاريخ ووقت الإرسال: {new Date(pending.requestedAt).toLocaleString("ar-YE")}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() =>
                              handleApproveSubscriptionUpgrade(merch.id, merch.storeName, pending.requestedPlanName)
                            }
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>الموافقة وترقية الباقة فوراً 🟢</span>
                          </button>

                          <button
                            onClick={() => handleRejectSubscriptionUpgrade(merch.id, merch.storeName)}
                            className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <AlertTriangle className="w-4 h-4" />
                            <span>رفض الطلب ❌</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Store className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>إدارة المشتركين وأقسام الاشتراكات بالمنصة</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs">
                        {subscribedMerchants.length} مشترك
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      متابعة تواريخ صلاحية الاشتراكات والتحكم في فئات الاشتراك الشهري والسنوي وباقات الخدمة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddMerchantOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-md"
                  >
                    <Store className="w-4 h-4" />
                    <span>إضافة تاجر جديد 🏬</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs: Monthly vs Yearly vs Pending Sections */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1 text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400 ml-2 text-[11px]">تصنيف أقسام الاشتراك:</span>
                  
                  <button
                    onClick={() => setMerchantSubCategoryFilter("ALL")}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      merchantSubCategoryFilter === "ALL"
                        ? "bg-indigo-600 text-white font-extrabold shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    جميع المشتركين ({subscribedMerchants.length})
                  </button>

                  <button
                    onClick={() => setMerchantSubCategoryFilter("MONTHLY")}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      merchantSubCategoryFilter === "MONTHLY"
                        ? "bg-indigo-600 text-white font-extrabold shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>قسم الاشتراكات الشهرية 🗓️</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-[10px] font-black">
                      {monthlyCount}
                    </span>
                  </button>

                  <button
                    onClick={() => setMerchantSubCategoryFilter("YEARLY")}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      merchantSubCategoryFilter === "YEARLY"
                        ? "bg-indigo-600 text-white font-extrabold shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>قسم الاشتراكات السنوية ⭐</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black">
                      {yearlyCount}
                    </span>
                  </button>

                  {pendingUpgradeMerchants.length > 0 && (
                    <button
                      onClick={() => setMerchantSubCategoryFilter("PENDING_UPGRADES")}
                      className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer animate-pulse ${
                        merchantSubCategoryFilter === "PENDING_UPGRADES"
                          ? "bg-amber-600 text-white font-extrabold shadow-xs"
                          : "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 hover:bg-amber-200"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>طلبات الترقية المعلقة ⏳</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                        {pendingUpgradeMerchants.length}
                      </span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  عرض {filteredMerchantsList.length} من أصل {subscribedMerchants.length}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">اسم المتجر والمالك</th>
                      <th className="p-3">المدينة والسجل</th>
                      <th className="p-3 text-center">فئة ونظام الاشتراك</th>
                      <th className="p-3 text-center">باقة الخدمة</th>
                      <th className="p-3 text-center">تاريخ ونهاية الصلاحية</th>
                      <th className="p-3 text-center">حالة الحساب والموافقة</th>
                      <th className="p-3 text-center">إجراءات الإدارة ⚙️</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
                    {filteredMerchantsList.map((merch) => {
                      const isApproved = merch.approvalStatus === "APPROVED";
                      const isPending = merch.approvalStatus === "PENDING";
                      const isSuspended = merch.approvalStatus === "SUSPENDED";
                      const hasPendingUpgrade =
                        !!merch.pendingSubscriptionChange &&
                        merch.pendingSubscriptionChange.status === "PENDING_APPROVAL";

                      const sub = merch.subscription;
                      const calculateDaysRemaining = (endDateStr?: string) => {
                        if (!endDateStr) return 0;
                        const end = new Date(endDateStr);
                        const today = new Date();
                        const diffTime = end.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays > 0 ? diffDays : 0;
                      };
                      const daysLeft = calculateDaysRemaining(sub.endDate);
                      const isYearly = sub.billingCycle === "YEARLY" || !sub.billingCycle;

                      return (
                        <tr
                          key={merch.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                            hasPendingUpgrade ? "bg-amber-50/30 dark:bg-amber-950/20" : ""
                          }`}
                        >
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">
                              {merch.storeName}
                            </div>
                            <div className="font-bold text-slate-600 dark:text-slate-400">{merch.ownerName}</div>
                            <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                              {merch.email} • {merch.phone}
                            </div>
                          </td>

                          <td className="p-3">
                            <div className="font-bold">{merch.city} - {merch.district}</div>
                            <div className="text-[10px] font-mono text-slate-500">س.ت: {merch.commercialReg}</div>
                          </td>

                          {/* Subscription Billing Cycle Category Selector */}
                          <td className="p-3 text-center">
                            <select
                              value={sub.billingCycle || "YEARLY"}
                              onChange={(e) =>
                                handleChangeMerchantBillingCycle(
                                  merch.id,
                                  merch.storeName,
                                  e.target.value as BillingCycle
                                )
                              }
                              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-extrabold focus:outline-none cursor-pointer ${
                                isYearly
                                  ? "bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200"
                                  : "bg-indigo-50 dark:bg-indigo-950/80 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200"
                              }`}
                            >
                              <option value="YEARLY">قسم اشتراك سنوي ⭐</option>
                              <option value="MONTHLY">قسم اشتراك شهري 🗓️</option>
                            </select>
                          </td>

                          {/* Subscription Service Plan Selector */}
                          <td className="p-3 text-center">
                            <div className="space-y-1">
                              <select
                                value={sub.planId}
                                onChange={(e) =>
                                  handleChangeMerchantTier(
                                    merch.id,
                                    merch.storeName,
                                    e.target.value as SubscriptionTier
                                  )
                                }
                                className="px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                              >
                                <option value="STARTER">باقة المبتدئ (Starter)</option>
                                <option value="PROFESSIONAL">باقة المتقدم (Pro)</option>
                                <option value="ENTERPRISE_VIP">باقة المؤسسات والـ VIP</option>
                              </select>

                              {hasPendingUpgrade && (
                                <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-700 text-[10px] text-amber-900 dark:text-amber-200 font-extrabold flex flex-col items-center gap-0.5 animate-pulse">
                                  <span>⏳ طلب ترقية معلق:</span>
                                  <span className="text-emerald-700 dark:text-emerald-300 font-black">
                                    {merch.pendingSubscriptionChange?.requestedPlanName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Subscription Start Date, End Date & Expiry Counter */}
                          <td className="p-3 text-center font-mono">
                            <div className="space-y-0.5">
                              <div className="text-[10px] text-slate-500 font-bold">
                                بداية: {sub.startDate || "2025-01-01"}
                              </div>
                              <div className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                                انتهاء: {sub.endDate || "2025-12-31"}
                              </div>
                              <div>
                                <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-black ${
                                  daysLeft > 0 
                                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                }`}>
                                  {daysLeft > 0 ? `متبقي ${daysLeft} يوم ⏳` : "منتهي الاشتراك ⚠️"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            {isApproved && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold inline-flex items-center gap-1">
                                <span>🟢</span>
                                <span>مُعتمد ونشط</span>
                              </span>
                            )}

                            {isPending && (
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-black animate-pulse inline-flex items-center gap-1">
                                <span>⏳</span>
                                <span>بانتظار الموافقة</span>
                              </span>
                            )}

                            {isSuspended && (
                              <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-black inline-flex items-center gap-1">
                                <span>⛔</span>
                                <span>موقوف مؤقتاً</span>
                              </span>
                            )}
                          </td>

                        <td className="p-3 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            {hasPendingUpgrade && (
                              <div className="flex items-center gap-1 p-1 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-300 dark:border-amber-700 w-full justify-center">
                                <button
                                  onClick={() =>
                                    handleApproveSubscriptionUpgrade(
                                      merch.id,
                                      merch.storeName,
                                      merch.pendingSubscriptionChange?.requestedPlanName
                                    )
                                  }
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] shadow-xs flex items-center gap-1 cursor-pointer"
                                  title="الموافقة على الترقية واعتماد الباقة الجديدة"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>اعتماد الترقية 🟢</span>
                                </button>

                                <button
                                  onClick={() => handleRejectSubscriptionUpgrade(merch.id, merch.storeName)}
                                  className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] shadow-xs flex items-center gap-1 cursor-pointer"
                                  title="رفض طلب الترقية"
                                >
                                  <span>✕ رفض</span>
                                </button>
                              </div>
                            )}

                            <div className="flex items-center justify-center gap-1.5">
                              {(isPending || isSuspended) && (
                                <button
                                  onClick={() => handleApproveMerchant(merch.id, merch.storeName)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow-sm transition-all flex items-center gap-1"
                                  title="منح موافقة الإدارة وتفعيل الدخول للتاجر"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{isPending ? "اعتماد الموافقة (المرة الأولى)" : "إعادة تفعيل الخدمة 🟢"}</span>
                                </button>
                              )}

                              {isApproved && (
                                <button
                                  onClick={() => handleSuspendMerchant(merch.id, merch.storeName)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] shadow-sm transition-all flex items-center gap-1"
                                  title="إيقاف الخدمة وإجبار التاجر على التواصل بخدمة العملاء"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>إيقاف الخدمة ⛔</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenEditMerchant(merch)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                                title="تعديل معلومات التاجر"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteMerchantAccount(merch.id, merch.storeName)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                                title="حذف حساب التاجر"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    })()}

      {/* ========================================================= */}
      {/* SUBTAB: MANAGE SUBSCRIPTIONS, PRICING & OFFERS */}
      {/* ========================================================= */}
      {activeSubTab === "MANAGE_SUBSCRIPTIONS" && (
        <SubscriptionManagement />
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: CUSTOMER MOVEMENTS & CRM TRACKER */}
      {/* ========================================================= */}
      {activeSubTab === "CUSTOMER_ACTIVITIES" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    متابعة تحركات وحركات بيع ومشتريات العملاء
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    سجل زمني حي لجميع عمليات طلبات الجملة وفواتير بيع المعرض والتجزئة
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedCustomerFilter}
                  onChange={(e) => setSelectedCustomerFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  <option value="ALL">جميع الحركات</option>
                  <option value="WHOLESALE_ORDER">طلبات الجملة للمصانع</option>
                  <option value="RETAIL_SALE">فواتير بيع التجزئة للزبائن</option>
                </select>

                <div className="relative flex-1 md:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="بحث بالاسم أو هاتف العميل..."
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Stream List */}
            <div className="space-y-3">
              {filteredCustomerMovements.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  لا توجد حركات عملاء تطابق شروط البحث حالياً
                </div>
              ) : (
                filteredCustomerMovements.map((mov) => {
                  const isWholesale = mov.type === "WHOLESALE_ORDER";
                  return (
                    <div
                      key={mov.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-3 rounded-xl text-white font-bold text-xs ${
                            isWholesale ? "bg-indigo-600" : "bg-emerald-600"
                          }`}
                        >
                          {isWholesale ? (
                            <ShoppingBag className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {mov.title}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isWholesale
                                  ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              }`}
                            >
                              {mov.clientRole}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-3">
                            <span>العميل: <strong className="text-slate-800 dark:text-slate-200">{mov.clientName}</strong></span>
                            <span>الهاتف: <strong className="font-mono">{mov.clientPhone}</strong></span>
                            <span>عدد الوحدات: <strong>{mov.itemsCount} قطعة</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-700">
                        <div className="text-left">
                          <strong className="text-sm font-extrabold text-slate-900 dark:text-white block">
                            {mov.amount.toLocaleString("ar-YE")} ر.ي
                          </strong>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(mov.date).toLocaleString("ar-YE")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedActivityDetail(mov)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>التفاصيل</span>
                          </button>

                          <button
                            onClick={() => handleDeleteCustomerActivity(mov.id, mov.type, mov.title)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="حذف الحركة من سجلات المنصة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 3: MANAGE FACTORIES */}
      {/* ========================================================= */}
      {activeSubTab === "MANAGE_FACTORIES" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  إدارة وقائمة إضافة المصانع الجديدة ({factories.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  إضافة مصنع جديد مع تحديد بيانات التواصل والسجل التجاري والتصنيف
                </p>
              </div>

              <button
                onClick={() => setIsAddFactoryOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة مصنع جديد 🏭</span>
              </button>
            </div>

            {/* Factories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {factories.map((fac) => {
                const facProds = products.filter((p) => p.factoryId === fac.id);
                return (
                  <div
                    key={fac.id}
                    className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={fac.logo}
                          alt={fac.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 bg-white shadow-xs"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {fac.name}
                          </h4>
                          <span className="text-xs text-slate-500 dark:text-slate-400 block">
                            {fac.categoryNameAr} | {fac.city}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteFactory(fac.id, fac.name)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="حذف المصنع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                      <div className="flex justify-between">
                        <span className="text-slate-400">السجل التجاري:</span>
                        <strong className="font-mono text-slate-800 dark:text-slate-200">
                          {fac.commercialReg || "1010887766"}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">الهاتف:</span>
                        <strong className="font-mono">{fac.phone}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">الحد الأدنى للطلب:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {fac.minOrderValue} ر.ي
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">وقت التجهيز:</span>
                        <strong>{fac.avgPreparationHours} ساعة</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          setSelectedFactoryIdForProduct(fac.id);
                          setIsAddProductOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة منتج ({facProds.length})</span>
                      </button>

                      <span className="text-[11px] text-slate-400 font-bold">
                        تقييم {fac.rating} ★
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 4: MANAGE FACTORY PRODUCTS */}
      {/* ========================================================= */}
      {activeSubTab === "MANAGE_PRODUCTS" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  كتالوج وإدارة منتجات المصانع المشتركة ({products.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  إضافة منتجات جملة جديدة للمصانع، تعديل الأسعار والكميات المتاحة
                </p>
              </div>

              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة منتج جملة جديد 📦</span>
              </button>
            </div>

            {/* Filter by factory */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                تصفية حسب المصنع:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                <option value="ALL">جميع المصانع ({products.length})</option>
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Products Matrix Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products
                .filter((p) => categoryFilter === "ALL" || p.factoryId === categoryFilter)
                .map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                          SKU: {prod.sku}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block">
                          {prod.factoryName}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {prod.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">سعر الجملة:</span>
                        <strong className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          {prod.price} ر.ي
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>الوحدة: {prod.unit}</span>
                        <span>المخزون: <strong className="text-slate-800 dark:text-slate-200">{prod.stock}</strong></span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-amber-600 font-bold">
                          أقل طلب: {prod.minQuantity}
                        </span>

                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 5: MANAGE FACTORY CATEGORIES */}
      {/* ========================================================= */}
      {activeSubTab === "MANAGE_CATEGORIES" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Tag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                    قائمة إدارة التصنيفات الرئيسية للمصانع
                  </h3>
                  <p className="text-xs text-slate-500">
                    يمكنك إضافة تصنيفات جديدة للمصانع، تعديل المسميات والوصف، أو حذف التصنيفات بالتزامن مع باقي أقسام المنصة
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddCategoryOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة تصنيف جديد 🏷️</span>
              </button>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriesList.map((cat) => {
                const assignedFactoriesCount = factories.filter((f) => f.category === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-amber-400 dark:hover:border-amber-500 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-mono font-bold text-[11px]">
                          الكود: {cat.id}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                          {assignedFactoriesCount} مصنع مسجل
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                          <Tag className="w-4 h-4" />
                        </span>
                        <span>{cat.nameAr}</span>
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {cat.description || "لا يوجد وصف إضافي لهذا التصنيف."}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setEditingCat(cat);
                          setEditCatNameAr(cat.nameAr);
                          setEditCatDesc(cat.description || "");
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-700/80 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>تعديل التصنيف</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 font-bold text-xs transition-all flex items-center gap-1.5"
                        title="حذف التصنيف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 5: PLATFORM SETTINGS & MANUAL BROADCAST NOTIFICATIONS */}
      {/* ========================================================= */}
      {activeSubTab === "PLATFORM_SETTINGS" && (
        <div className="space-y-6">
          {/* Top Info Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-purple-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
                <Settings className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  <span>إعدادات ورقم تواصل المنصة وإرسال التعاميم</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/30">
                    مركز التحكم الإداري
                  </span>
                </h3>
                <p className="text-xs text-purple-200/80 mt-1">
                  تعديل بيانات ورقم تواصل المنصة الرئيسي، وتحديث هوية المورد، بالإضافة إلى بث إشعارات وتعاميم مباشرة للمصانع والتجار
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Platform Profile & Contact Info Settings (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                      بيانات الهوية ورقم تواصل المنصة الرئيسي
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      سيظهر رقم التواصل والبريد الإلكتروني المعتمد لكافة المصانع والتجار الموردين
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSavePlatformSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      اسم المنصة / المركز الرئيسي *
                    </label>
                    <input
                      type="text"
                      required
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      placeholder="مثال: منصة إمداد B2B المركزية"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      اسم المدير المسؤول / المشرف *
                    </label>
                    <input
                      type="text"
                      required
                      value={platformOwner}
                      onChange={(e) => setPlatformOwner(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                      placeholder="مثال: إدارة المبيعات والتوريد"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold">
                        <Phone className="w-3.5 h-3.5" />
                        <span>رقم تواصل المنصة والدعم الفني *</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      value={platformPhone}
                      onChange={(e) => setPlatformPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-400 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-extrabold text-sm font-mono"
                      placeholder="770000000"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      يتصل عليه التجار والمصانع مباشرة للطلب والاستفسارات الفنية
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      البريد الإلكتروني الرسمي
                    </label>
                    <input
                      type="email"
                      required
                      value={platformEmail}
                      onChange={(e) => setPlatformEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                      placeholder="info@emdad.ye"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      المدينة المقر
                    </label>
                    <input
                      type="text"
                      value={platformCity}
                      onChange={(e) => setPlatformCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      المنطقة / الحي
                    </label>
                    <input
                      type="text"
                      value={platformDistrict}
                      onChange={(e) => setPlatformDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      رقم السجل التجاري
                    </label>
                    <input
                      type="text"
                      value={platformCR}
                      onChange={(e) => setPlatformCR(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    العنوان التفصيلي للمقر الرئيسي
                  </label>
                  <input
                    type="text"
                    value={platformAddress}
                    onChange={(e) => setPlatformAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 hover:scale-[1.01]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ بيانات وإعدادات المنصة 💾</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Send Manual Notification / Announcement to Factories & Merchants (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                      إرسال إشعار / تعميم يدوي للمصانع
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      بث تحديثات، أخبار أو تعليمات هامة للمصانع والتجار فورياً
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSendManualNotification} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    الجهة المستهدفة للتعميم *
                  </label>
                  <select
                    value={notifTargetRole}
                    onChange={(e) => setNotifTargetRole(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="FACTORY">🏭 جميع المصانع المشتركة والموردة</option>
                    <option value="WHOLESALER">🏬 جميع التجار والمحلات التجارية</option>
                    <option value="ALL">🌐 تعميم عام لكافة مستخدمي المنصة (مصانع وتجار)</option>
                  </select>
                </div>

                {notifTargetRole === "FACTORY" && (
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      تحديد مصنع معين (أو الجميع)
                    </label>
                    <select
                      value={notifFactoryId}
                      onChange={(e) => setNotifFactoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                    >
                      <option value="ALL">📢 جميع المصانع الوطنية (بث عام)</option>
                      {subscribedFactoriesAccounts.map((f) => (
                        <option key={f.id} value={f.id}>
                          🏢 {f.factoryName} ({f.ownerName})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    عنوان التعميم / الخبر *
                  </label>
                  <input
                    type="text"
                    required
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="مثال: تحديث مواعيد التوريد والتحميل لشهري يوليو وأغسطس"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    تفاصيل الرسالة والتعميم بالكامل *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    placeholder="اكتب هنا تفاصيل الخبر أو التنبيه المطلوب إيصاله لإدارات المصانع أو التجار..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال التعميم والإشعار الآن 📢</span>
                </button>
              </form>

              {/* Sent Broadcasts History */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h5 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center justify-between">
                  <span>سجل الإشعارات والتعاميم الصادرة مؤخراً</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {storeService.getNotifications().length} إشعار
                  </span>
                </h5>

                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {storeService.getNotifications().length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-bold">
                      لا توجد إشعارات سابقة حتى الآن
                    </div>
                  ) : (
                    storeService.getNotifications().map((n) => (
                      <div
                        key={n.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-purple-700 dark:text-purple-300">
                            {n.title}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-400 font-mono">{n.timestamp}</span>
                            <button
                              type="button"
                              onClick={() => storeService.deleteNotification(n.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded"
                              title="حذف الإشعار"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                          <span>الجهة: {n.targetRole === "FACTORY" ? "المصانع 🏭" : "التجار 🏬"}</span>
                          {n.factoryId && n.factoryId !== "ALL" && (
                            <span>• مصنع مخصص: {n.factoryId}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD NEW FACTORY */}
      {/* ========================================================= */}
      {isAddFactoryOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    إضافة مصنع جديد إلى المنصة
                  </h3>
                  <p className="text-xs text-slate-500">
                    أدخل بيانات المصنع الوطني ليظهر فوراً بكتالوج الموردين المعتمدين
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddFactoryOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFactory} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المصنع الرسمي *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFactoryName}
                    onChange={(e) => setNewFactoryName(e.target.value)}
                    placeholder="مثال: مصنع الوفاء للصناعات الغذائية"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المالك / مدير المصنع *
                  </label>
                  <input
                    type="text"
                    required
                    value={newFactoryOwnerName}
                    onChange={(e) => setNewFactoryOwnerName(e.target.value)}
                    placeholder="مثال: المهندس أحمد علي"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Login Credentials Section */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
                  <Key className="w-4 h-4 text-indigo-600" />
                  <span>بيانات حساب دخول المصنع (اسم المستخدم وكلمة المرور):</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اسم المستخدم / البريد للدخول *
                    </label>
                    <input
                      type="text"
                      required
                      value={newFactoryEmail}
                      onChange={(e) => setNewFactoryEmail(e.target.value)}
                      placeholder="info@factory.ye"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      كلمة المرور للتطبيقات *
                    </label>
                    <input
                      type="text"
                      required
                      value={newFactoryPassword}
                      onChange={(e) => setNewFactoryPassword(e.target.value)}
                      placeholder="123456"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التصنيف الرئيسي
                  </label>
                  <select
                    value={newFactoryCategory}
                    onChange={(e) =>
                      setNewFactoryCategory(e.target.value as FactoryCategory)
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameAr} ({cat.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={newFactoryCity}
                    onChange={(e) => setNewFactoryCity(e.target.value)}
                    placeholder="صنعاء، عدن..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الحي / المنطقة الصناعية
                  </label>
                  <input
                    type="text"
                    value={newFactoryDistrict}
                    onChange={(e) => setNewFactoryDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    العنوان التفصيلي وموقع المصنع
                  </label>
                  <input
                    type="text"
                    value={newFactoryAddress}
                    onChange={(e) => setNewFactoryAddress(e.target.value)}
                    placeholder="شارع الخمسين، القطعة 12"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم السجل التجاري
                  </label>
                  <input
                    type="text"
                    value={newFactoryCR}
                    onChange={(e) => setNewFactoryCR(e.target.value)}
                    placeholder="1010xxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف / الاتصال
                  </label>
                  <input
                    type="text"
                    value={newFactoryPhone}
                    onChange={(e) => setNewFactoryPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الحد الأدنى للطلب (ر.ي)
                  </label>
                  <input
                    type="number"
                    value={newFactoryMinOrder}
                    onChange={(e) => setNewFactoryMinOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ساعات التجهيز المتوقعة
                  </label>
                  <input
                    type="number"
                    value={newFactoryPrepHours}
                    onChange={(e) => setNewFactoryPrepHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Factory Logo Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>صورة شعار المصنع (رفع محلي من جهازك):</span>
                  </label>

                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setFactoryLogoMode("FILE")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                        factoryLogoMode === "FILE"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>رفع من الجهاز 📱</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFactoryLogoMode("URL")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                        factoryLogoMode === "URL"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>رابط صورة web</span>
                    </button>
                  </div>
                </div>

                {factoryLogoMode === "FILE" ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={factoryLogoFileInputRef}
                      accept="image/*"
                      onChange={handleFactoryLogoFileChange}
                      className="hidden"
                    />

                    {factoryLogoPreview ? (
                      <div className="relative rounded-2xl border border-indigo-200 dark:border-indigo-800 p-2 bg-indigo-50/30 dark:bg-indigo-950/20 flex items-center gap-3">
                        <img
                          src={factoryLogoPreview}
                          alt="معاينة الشعار"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                            تم رفع شعار المصنع محلياً بنجاح ✓
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            جاهز للعرض في دليل المصانع والمنتجات
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => factoryLogoFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px]"
                        >
                          تغيير الشعار
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => factoryLogoFileInputRef.current?.click()}
                        className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 rounded-2xl p-4 text-center bg-indigo-50/20 dark:bg-indigo-950/10 cursor-pointer transition-all space-y-1.5"
                      >
                        <Upload className="w-6 h-6 text-indigo-500 mx-auto" />
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-xs">
                          اضغط هنا لاختيار صورة شعار المصنع من جهازك مباشرة
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          تدعم صور PNG, JPG, WEBP حتى 8 ميجابايت (بدون الحاجة لرابط خارجي)
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={newFactoryLogo}
                    onChange={(e) => {
                      setNewFactoryLogo(e.target.value);
                      setFactoryLogoPreview(e.target.value);
                    }}
                    placeholder="https://example.com/factory-logo.jpg"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                  />
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddFactoryOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  إعتماد إضافة المصنع 🏭
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ADD PRODUCT TO FACTORY */}
      {/* ========================================================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    إضافة منتج جملة جديد لكتالوج مصنع
                  </h3>
                  <p className="text-xs text-slate-500">
                    أدخل بيانات منتج الجملة للبيع والتوريد المباشر عبر منصة إمداد
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المصنع المصنّع للمنتج *
                </label>
                <select
                  value={selectedFactoryIdForProduct}
                  onChange={(e) => setSelectedFactoryIdForProduct(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                >
                  {factories.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المنتج بالجملة *
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="مثال: زيت زيتون نقي بكر ممتاز 1 لتر"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    سعر الجملة (ر.ي) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الوحدة التعبوية
                  </label>
                  <input
                    type="text"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    placeholder="كرتونة (12 حبة)، كيس 10 كجم..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المخزون المتوفر الأولي
                  </label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    أقل كمية للطلب الجملة
                  </label>
                  <input
                    type="number"
                    value={newProdMinQty}
                    onChange={(e) => setNewProdMinQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  وصف المنتج والمواصفات
                </label>
                <textarea
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="المواصفات، فترة الصلاحية، بلد المنشأ..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Product Image Upload Section */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>صورة المنتج (رفع محلي من جهازك):</span>
                  </label>

                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setProdImageMode("FILE")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                        prodImageMode === "FILE"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>رفع من الجهاز 📱</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProdImageMode("URL")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                        prodImageMode === "URL"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>رابط صورة web</span>
                    </button>
                  </div>
                </div>

                {prodImageMode === "FILE" ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={prodImageFileInputRef}
                      accept="image/*"
                      onChange={handleProdImageFileChange}
                      className="hidden"
                    />

                    {prodImagePreview ? (
                      <div className="relative rounded-2xl border border-emerald-200 dark:border-emerald-800 p-2 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center gap-3">
                        <img
                          src={prodImagePreview}
                          alt="معاينة المنتج"
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                            تم رفع صورة المنتج محلياً بنجاح ✓
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            جاهز للعرض في الكتالوج للعملاء والجملة
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => prodImageFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                        >
                          تغيير الصورة
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => prodImageFileInputRef.current?.click()}
                        className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 hover:border-emerald-500 rounded-2xl p-4 text-center bg-emerald-50/20 dark:bg-emerald-950/10 cursor-pointer transition-all space-y-1.5"
                      >
                        <Upload className="w-6 h-6 text-emerald-500 mx-auto" />
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block text-xs">
                          اضغط هنا لاختيار صورة المنتج من جهازك المحمول أو الكمبيوتر
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          تدعم PNG, JPG, WEBP حتى 8 ميجابايت (بدون الحاجة لرابط خارجي)
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={newProdImage}
                    onChange={(e) => {
                      setNewProdImage(e.target.value);
                      setProdImagePreview(e.target.value);
                    }}
                    placeholder="https://example.com/product-image.jpg"
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                  />
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  حفظ المنتج بكتالوج المصنع 📦
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ACTIVITY DETAIL MODAL */}
      {/* ========================================================= */}
      {selectedActivityDetail && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                تفاصيل حركة العميل: {selectedActivityDetail.id}
              </h3>
              <button
                onClick={() => setSelectedActivityDetail(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl space-y-1">
                <div>العميل: <strong className="text-slate-900 dark:text-white">{selectedActivityDetail.clientName}</strong></div>
                <div>الهاتف: <strong className="font-mono">{selectedActivityDetail.clientPhone}</strong></div>
                <div>النوع: <strong>{selectedActivityDetail.clientRole}</strong></div>
                <div>المبلغ الإجمالي: <strong className="text-emerald-600 font-bold">{selectedActivityDetail.amount.toLocaleString("ar-YE")} ر.ي</strong></div>
                <div>التاريخ: <span>{new Date(selectedActivityDetail.date).toLocaleString("ar-YE")}</span></div>
              </div>
            </div>

            <div className="pt-2 text-left">
              <button
                onClick={() => setSelectedActivityDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW MERCHANT */}
      {/* ========================================================= */}
      {isAddMerchantOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    تسجيل وإضافة تاجر / منشأة تجارية جديدة 🏬
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    إنشاء حساب تاجر جديد مباشرة بالمنصة وتحديد باقة الاشتراك والاعتماد
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddMerchantOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMerchant} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المتجر / المنشأة *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMerchantStoreName}
                    onChange={(e) => setNewMerchantStoreName(e.target.value)}
                    placeholder="مثال: أسواق السلام للتجارة"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المالك / صاحب المنشأة *
                  </label>
                  <input
                    type="text"
                    required
                    value={newMerchantOwnerName}
                    onChange={(e) => setNewMerchantOwnerName(e.target.value)}
                    placeholder="مثال: عبدالمجيد محمد الكبسي"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    البريد الإلكتروني للتاجر *
                  </label>
                  <input
                    type="email"
                    required
                    value={newMerchantEmail}
                    onChange={(e) => setNewMerchantEmail(e.target.value)}
                    placeholder="merchant@domain.ye"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كلمة المرور الافتراضية
                  </label>
                  <input
                    type="text"
                    value={newMerchantPassword}
                    onChange={(e) => setNewMerchantPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الجوال / الواتساب
                  </label>
                  <input
                    type="text"
                    value={newMerchantPhone}
                    onChange={(e) => setNewMerchantPhone(e.target.value)}
                    placeholder="770000000"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم السجل التجاري
                  </label>
                  <input
                    type="text"
                    value={newMerchantCR}
                    onChange={(e) => setNewMerchantCR(e.target.value)}
                    placeholder="1010889900"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المدينة
                  </label>
                  <select
                    value={newMerchantCity}
                    onChange={(e) => setNewMerchantCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="صنعاء">صنعاء</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="إب">إب</option>
                    <option value="المكلا">المكلا</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الحي / المنطقة
                  </label>
                  <input
                    type="text"
                    value={newMerchantDistrict}
                    onChange={(e) => setNewMerchantDistrict(e.target.value)}
                    placeholder="العاصمة / التحرير"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    فئة ونظام الاشتراك 🗓️⭐
                  </label>
                  <select
                    value={newMerchantBillingCycle}
                    onChange={(e) => setNewMerchantBillingCycle(e.target.value as BillingCycle)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="YEARLY">فئة الاشتراك السنوي ⭐ (50,000 ر.ي / سنة - توفير 10,000 ر.ي)</option>
                    <option value="MONTHLY">فئة الاشتراك الشهري 🗓️ (5,000 ر.ي / شهر)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  العنوان التفصيلي
                </label>
                <input
                  type="text"
                  value={newMerchantAddress}
                  onChange={(e) => setNewMerchantAddress(e.target.value)}
                  placeholder="شارع الخمسين، بجانب مركز التسوق"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-xs">
                    اعتماد حساب التاجر فوراً 🟢
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    تمكين التاجر من تسجيل الدخول مباشرة دون الحاجة للانتظار
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newMerchantAutoApprove}
                  onChange={(e) => setNewMerchantAutoApprove(e.target.checked)}
                  className="w-5 h-5 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMerchantOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Store className="w-4 h-4" />
                  <span>إضافة وتأكيد الحساب 🏬</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: ADD NEW CATEGORY */}
      {/* ========================================================= */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    إضافة تصنيف جديد للمصانع
                  </h3>
                  <p className="text-xs text-slate-500">
                    أدخل مسمى التصنيف الرئيسي ليتوفر فوراً عند تسجيل أي مصنع
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddCategoryOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم التصنيف بالعربي *
                </label>
                <input
                  type="text"
                  required
                  value={newCatNameAr}
                  onChange={(e) => setNewCatNameAr(e.target.value)}
                  placeholder="مثال: أقمشة ومنسوجات، أثاث ومفروشات..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  كود/مُعرّف التصنيف (اختياري بالإنكليزية)
                </label>
                <input
                  type="text"
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  placeholder="مثال: textiles, furniture"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  وصف تفصيلي للتصنيف
                </label>
                <textarea
                  rows={3}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="اكتب نبذة مختصرة عن المنتجات والصناعات التابعة لهذا التصنيف..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold shadow-md"
                >
                  حفظ التصنيف 🏷️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: EDIT CATEGORY */}
      {/* ========================================================= */}
      {editingCat && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    تعديل بيانات التصنيف ({editingCat.id})
                  </h3>
                  <p className="text-xs text-slate-500">
                    تحديث مسمى التصنيف أو الوصف الخاص به
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingCat(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم التصنيف بالعربي *
                </label>
                <input
                  type="text"
                  required
                  value={editCatNameAr}
                  onChange={(e) => setEditCatNameAr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  وصف التصنيف
                </label>
                <textarea
                  rows={3}
                  value={editCatDesc}
                  onChange={(e) => setEditCatDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md"
                >
                  حفظ التعديلات 💾
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: DELETE CATEGORY CONFIRMATION */}
      {deletingCat && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  تأكيد حذف التصنيف الرئيسي
                </h3>
                <span className="text-xs font-mono font-bold text-rose-600 block">
                  {deletingCat.nameAr} ({deletingCat.id})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              هل أنت تأكد من رغبتك في إزالة تصنيف <strong className="text-slate-900 dark:text-white">"{deletingCat.nameAr}"</strong> من قائمة التصنيفات الرئيسية للمنصة؟
            </p>

            {factories.filter((f) => f.category === deletingCat.id).length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 font-bold">
                ⚠️ تنبيه: يوجد ({factories.filter((f) => f.category === deletingCat.id).length}) مصنع مسجل في هذا التصنيف حالياً.
              </div>
            )}

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingCat(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                إلغاء الحفظ
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تأكيد الحذف النهائي</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL 7: GENERIC DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  تأكيد الحذف النهائي
                </h3>
                <span className="text-xs font-bold text-rose-600 block">
                  {deleteConfirmItem.title}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {deleteConfirmItem.message}
            </p>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 font-bold">
              ⚠️ تنبيه: لا يمكن التراجع عن هذه الخطوة بعد التأكيد والحذف.
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConfirmItem.onConfirm();
                  setDeleteConfirmItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>تأكيد الحذف 🗑️</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT FACTORY MODAL */}
      {editingFactoryAccount && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold">
                <Building2 className="w-5 h-5" />
                <h3 className="text-slate-900 dark:text-white text-base">
                  تعديل بيانات المصنع ({editingFactoryAccount.factoryName})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingFactoryAccount(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditFactory} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المصنع *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFacName}
                    onChange={(e) => setEditFacName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    اسم الماللك / المدير *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFacOwner}
                    onChange={(e) => setEditFacOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المستخدم للدخول (Username)
                  </label>
                  <input
                    type="text"
                    placeholder="factory_user"
                    value={editFacUsername}
                    onChange={(e) => setEditFacUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    required
                    value={editFacEmail}
                    onChange={(e) => setEditFacEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFacPhone}
                    onChange={(e) => setEditFacPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    رقم السجل التجاري
                  </label>
                  <input
                    type="text"
                    value={editFacCommReg}
                    onChange={(e) => setEditFacCommReg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    قطاع التصنيع / التصنيف
                  </label>
                  <select
                    value={editFacCategory}
                    onChange={(e) => setEditFacCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="FOOD">صناعات غذائية ومشروبات</option>
                    <option value="PLASTIC">بلاستيك وتعبئة وتغليف</option>
                    <option value="TEXTILE">منسوجات وأقمشة وملابس</option>
                    <option value="CHEMICAL">منظفات ومستلزمات كيميائية</option>
                    <option value="ELECTRONICS">أجهزة وإلكترونيات</option>
                    <option value="OTHER">قطاعات أخرى عامة</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    المحافظة / المدينة
                  </label>
                  <input
                    type="text"
                    value={editFacCity}
                    onChange={(e) => setEditFacCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    المديرية / المنطقة
                  </label>
                  <input
                    type="text"
                    value={editFacDistrict}
                    onChange={(e) => setEditFacDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    العنوان التفصيلي
                  </label>
                  <input
                    type="text"
                    value={editFacAddress}
                    onChange={(e) => setEditFacAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    الحد الأدنى للطلب (ر.ي)
                  </label>
                  <input
                    type="number"
                    value={editFacMinOrder}
                    onChange={(e) => setEditFacMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    مدة التجهيز المتوقعة (ساعات)
                  </label>
                  <input
                    type="number"
                    value={editFacPrepHours}
                    onChange={(e) => setEditFacPrepHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-extrabold text-amber-700 dark:text-amber-400 mb-1">
                    تغيير كلمة المرور (اختياري - اتركه فارغاً إذا لم ترد التغيير)
                  </label>
                  <input
                    type="password"
                    placeholder="كلمة مرور جديدة للمصنع..."
                    value={editFacPassword}
                    onChange={(e) => setEditFacPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFactoryAccount(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ التعديلات 💾</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MERCHANT MODAL */}
      {editingMerchantAccount && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 dir-rtl overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold">
                <Store className="w-5 h-5" />
                <h3 className="text-slate-900 dark:text-white text-base">
                  تعديل بيانات التاجر ({editingMerchantAccount.storeName})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMerchantAccount(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMerchant} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المتجر / المحل *
                  </label>
                  <input
                    type="text"
                    required
                    value={editMerchStoreName}
                    onChange={(e) => setEditMerchStoreName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    اسم الماللك / التاجر *
                  </label>
                  <input
                    type="text"
                    required
                    value={editMerchOwner}
                    onChange={(e) => setEditMerchOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المستخدم للدخول (Username)
                  </label>
                  <input
                    type="text"
                    value={editMerchUsername}
                    onChange={(e) => setEditMerchUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={editMerchEmail}
                    onChange={(e) => setEditMerchEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="text"
                    required
                    value={editMerchPhone}
                    onChange={(e) => setEditMerchPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    رقم السجل التجاري / الترخيص
                  </label>
                  <input
                    type="text"
                    value={editMerchCommReg}
                    onChange={(e) => setEditMerchCommReg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    المحافظة / المدينة
                  </label>
                  <input
                    type="text"
                    value={editMerchCity}
                    onChange={(e) => setEditMerchCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    المديرية / المنطقة
                  </label>
                  <input
                    type="text"
                    value={editMerchDistrict}
                    onChange={(e) => setEditMerchDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1">
                    العنوان التفصيلي
                  </label>
                  <input
                    type="text"
                    value={editMerchAddress}
                    onChange={(e) => setEditMerchAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-extrabold text-amber-700 dark:text-amber-400 mb-1">
                    تغيير كلمة المرور (اختياري - اتركه فارغاً إذا لم ترد التغيير)
                  </label>
                  <input
                    type="password"
                    placeholder="كلمة مرور جديدة للتاجر..."
                    value={editMerchPassword}
                    onChange={(e) => setEditMerchPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingMerchantAccount(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>حفظ التعديلات 💾</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
