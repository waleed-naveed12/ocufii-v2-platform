using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OcufiiAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddLastUnlinkedByToSafetyLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LastUnlinkedBy",
                table: "SafetyLinks",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastUnlinkedBy",
                table: "SafetyLinks");
        }
    }
}
