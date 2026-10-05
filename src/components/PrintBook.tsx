import type { Tables } from "@/integrations/supabase/types";
import { useMediaUrl } from "@/lib/media";
export function PrintBook({ title, pages }: { title: string; pages: Tables<"story_pages">[] }) {
  return <div className="print-book"><section className="print-cover"><h1>{title}</h1><p>CyliaTales</p></section>{pages.map(page => <PrintPage key={page.id} page={page}/>)}</div>;
}
function PrintPage({ page }: { page: Tables<"story_pages"> }) {
  const image = useMediaUrl(page.image_url);
  return <section className="print-page">{image && <img src={image} alt={`Page ${page.page_number}`}/>}<p>{page.text}</p><small>{page.page_number}</small></section>;
}