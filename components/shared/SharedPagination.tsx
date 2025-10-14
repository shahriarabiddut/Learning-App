import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useIsMobile } from "../ui/use-mobile";

interface SharedPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
  itemsPerPageOptions?: number[];
}

const SharedPagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [12, 24, 48, 120, 240],
}: SharedPaginationProps) => {
  const isMobile = useIsMobile();
  return (
    <>
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-3 lg:space-x-8">
          <div className="hidden md:flex text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 md:w-16 p-1"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" /> {!isMobile && "First"}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 md:w-16 p-1"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              {!isMobile && "Last"} <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mx-3">
          <span className="text-sm text-muted-foreground">Items</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
          >
            {/* {[2, 4, 5, 6].map((size) => ( */}
            {itemsPerPageOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile View */}
      <div className="flex md:hidden text-sm text-muted-foreground items-center justify-center">
        Page {currentPage} of {totalPages}
      </div>
    </>
  );
};

export default SharedPagination;
