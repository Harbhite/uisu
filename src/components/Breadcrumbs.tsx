import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6 hidden md:block">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>
          <Link to="/" className="hover:text-accent transition-colors flex items-center">
            <Home size={14} />
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const displayName = name.replace(/-/g, " ");

          return (
            <li key={name} className="flex items-center">
              <ChevronRight size={14} className="mx-2 text-border" />
              {isLast ? (
                <span className="font-medium text-foreground capitalize" aria-current="page">
                  {displayName}
                </span>
              ) : (
                <Link to={routeTo} className="hover:text-accent transition-colors capitalize">
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
